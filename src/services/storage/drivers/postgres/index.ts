import cryptoRandomString from 'crypto-random-string'
import Knex from 'knex'
import { join } from 'path'
import { NotFoundError, GeneralError } from '../../../../errors/errors.js'
import type { StorageDriver } from '../../types'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import camelcaseKeys from 'camelcase-keys'
import { snakeCase } from 'snake-case'
import type { StoredUrl, UrlWithInformation, UrlRequestData, UrlInformation } from '../../types/url.js'
import { PostgresStorageConfig } from '../../types/config.js'
import { CountersCache } from './types.js'
import { logger } from '../../../logger/logger.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
export class PostgresStorage implements StorageDriver {
	private db: Knex
	private countersCache: CountersCache
	private countersCacheFlushInterval: NodeJS.Timeout

	constructor(private config: PostgresStorageConfig) {
		this.db = Knex({
			client: 'postgres',
			...config.driverConfig,
			migrations: {
				schemaName: config.appName,
			},
			searchPath: [config.appName],
			postProcessResponse: (result) => {
				if (Array.isArray(result)) {
					return result.map((row) => camelcaseKeys(row))
				} else {
					return camelcaseKeys(result)
				}
			},
			wrapIdentifier: (value, origImpl) => {
				// Regex matches nothing (anything string has an 'a' before the beginning of the string)
				return origImpl(snakeCase(value, { stripRegexp: /a^/ }))
			},
		})

		// Generates a random seed for the psuedo_encrypt function found in the first migration
		process.env.MIGRATIONS_RANDOM_SEED_1 = cryptoRandomString({ length: 6, type: 'numeric' })
		process.env.MIGRATIONS_RANDOM_SEED_2 = cryptoRandomString({ length: 4, type: 'numeric' })

		this.countersCache = {}

		this.countersCacheFlushInterval = setInterval(this.pushUpdates.bind(this), 10000)
	}
	public async initialize(): Promise<void> {
		await this.upMigrations()
	}
	public async shutdown(): Promise<void> {
		clearInterval(this.countersCacheFlushInterval)
		return
	}
	private async upMigrations() {
		// For new migrations, see the contribution guide's common issues section
		await this.db.schema.createSchemaIfNotExists(this.config.appName)
		await this.db.migrate.latest({ directory: join(__dirname, './migrations'), tableName: 'migrations' })
	}
	// Unused for now
	private async downMigrations() {
		try {
			await this.db.migrate.rollback({ directory: join(__dirname, './migrations'), tableName: 'migrations' })
		} catch (e) {
			// 3F000 is the error code from 'schema does not exist', which will happen if
			// the schema has already been deleted, so we can safely ignore
			if (e.code !== '3F000') throw e
		}
		await Promise.all([
			this.db.schema.dropTableIfExists('migrations'),
			this.db.schema.dropTableIfExists('migrations_lock'),
		])
		await this.db.schema.dropSchemaIfExists(this.config.appName)
	}

	public async pushUpdates(): Promise<void> {
		const currCounters = this.countersCache
		this.countersCache = {}
		try {
			await this.db.raw(
				Object.keys(currCounters).reduce((acc, currId) => {
					const currInfoCount = currCounters[currId].infoCount
					const currVisitCount = currCounters[currId].visitCount
					return (
						acc +
						`UPDATE url_information SET info_visit_count = info_visit_count + ${currInfoCount}, url_visit_count = url_visit_count + ${currVisitCount} WHERE url_id = '${currId}';`
					)
				}, ''),
			)
		} catch (err) {
			logger.error('Update counters failed!', err)
			// Revert countersCache changes since we failed the update
			Object.keys(currCounters).forEach((id) => {
				if (Object.keys(this.countersCache).includes(id)) {
					this.countersCache[id].visitCount += currCounters[id].visitCount
					this.countersCache[id].infoCount += currCounters[id].infoCount
				} else {
					this.countersCache[id].visitCount = currCounters[id].visitCount
					this.countersCache[id].infoCount = currCounters[id].infoCount
				}
			})
		}
	}

	url = new (class PostgresUrlStorage {
		constructor(public storage: PostgresStorage) {}

		public async get(id: string, options = { withInfo: false }): Promise<StoredUrl | UrlWithInformation> {
			let storedUrl, urlInfo
			if (!options.withInfo) {
				storedUrl = await this.storage.db
					.table<StoredUrl & { serial?: number }>('urls')
					.select('*')
					.where('id', id)
					.first()

				delete storedUrl?.serial
			} else {
				urlInfo = await this.storage.db
					.table<UrlInformation>('url_information')
					.select('ip', 'url_visit_count', 'info_visit_count', 'last_used', 'request_url')
					.where('url_id', id)
					.join('urls', 'url_information.url_id', 'urls.id')
					.first()
			}
			if (!storedUrl && !urlInfo) throw NotFoundError()
			return options.withInfo ? urlInfo : storedUrl
		}

		//All Info associated with that Urls also get deleted, automatically.
		//https://stackoverflow.com/questions/53859207/deleting-data-from-associated-tables-using-knex-js
		public async delete(id: string): Promise<void> {
			await this.storage.db.table<StoredUrl>('urls').where('id', id).delete()
			return
		}

		public async deleteOverdue(timespanMs: number): Promise<number> {
			const deleteBefore = new Date(new Date().getTime() - timespanMs)
			return await this.storage.db.table<StoredUrl>('urls').where('updatedAt', '<', deleteBefore).delete()
		}

		public async edit(id: string, url: string): Promise<StoredUrl> {
			const [storedUrl] = await this.storage.db
				.table<StoredUrl>('urls')
				.update({ url })
				.where('id', id)
				.returning('*')

			if (!url) throw NotFoundError()
			return storedUrl
		}

		public async save({ url, id = '', ip, requestUrl }: UrlRequestData): Promise<StoredUrl> {
			const urlInfo: UrlInformation = {
				ip,
				urlVisitCount: 0,
				infoVisitCount: 0,
				lastUsed: new Date().toISOString(),
				requestUrl,
			}

			if (!url) throw NotFoundError()

			if (id && (await this.storage.db.table<StoredUrl>('urls').select('*').where('id', id).first())) {
				throw new GeneralError('The specific id you chose is already in use')
			}

			const [storedUrl] = await this.storage.db.table<StoredUrl>('urls').insert({ url, id }).returning('*')

			await this.storage.db
				.table<UrlInformation & { urlId: string }>('url_information')
				.insert({ urlId: storedUrl.id, ...urlInfo })

			return storedUrl
		}

		public incVisitCount(id: string): void {
			const currCountersCache = this.storage.countersCache
			if (currCountersCache[id]) currCountersCache[id].visitCount += 1
			else
				currCountersCache[id] = {
					infoCount: 0,
					visitCount: 1,
				}
			this.storage.countersCache = currCountersCache
		}

		public incInfoCount(id: string): void {
			const currCountersCache = this.storage.countersCache
			if (currCountersCache[id]) currCountersCache[id].infoCount += 1
			else
				currCountersCache[id] = {
					infoCount: 1,
					visitCount: 0,
				}
			this.storage.countersCache = currCountersCache
		}
	})(this)
}

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
import { SqliteStorageConfig } from '../../types/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export class SqliteStorage implements StorageDriver {
	private db: Knex

	constructor(private config: SqliteStorageConfig) {
		this.db = Knex({
			client: 'sqlite',
			...config.driverConfig,
			useNullAsDefault: true,
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
	}
	public async initialize(): Promise<void> {
		await this.upMigrations()
	}
	public async shutdown(): Promise<void> {
		return
	}
	private async upMigrations() {
		// For new migrations, see the contribution guide's common issues section
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
	}
	url = new (class SqliteUrlStorage {
		constructor(public storage: SqliteStorage) {}

		public async get(id: string, options = { withInfo: false }): Promise<StoredUrl | UrlWithInformation> {
			let storedUrl, urlWithInfo
			if (!options.withInfo) {
				storedUrl = await this.storage.db
					.table<StoredUrl & { serial?: number }>('urls')
					.select('*')
					.where('id', id)
					.first()

				delete storedUrl?.serial
			} else {
				urlWithInfo = await this.storage.db
					.table<UrlInformation>('url_information')
					.select(
						'id',
						'url',
						'ip',
						'url_visit_count',
						'info_visit_count',
						'last_used',
						'created_at',
						'updated_at',
					)
					.where('url_id', id)
					.join('urls', 'url_information.url_id', 'urls.id')
					.first()
			}
			if (!storedUrl && !urlWithInfo) throw NotFoundError()
			return options.withInfo ? urlWithInfo : storedUrl
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
			await this.storage.db.table<StoredUrl>('urls').update({ url }).where('id', id)
			const storedUrl = await this.get(id)

			if (!url) throw NotFoundError()
			return storedUrl
		}

		public async save({ url, id = '', ip }: UrlRequestData): Promise<StoredUrl> {
			const urlInfo: UrlInformation = {
				ip,
				urlVisitCount: 0,
				infoVisitCount: 0,
				lastUsed: new Date().toISOString(),
			}

			if (!url) throw NotFoundError()

			if (id && (await this.storage.db.table<StoredUrl>('urls').select('*').where('id', id).first())) {
				throw new GeneralError('The specific id you chose is already in use')
			}

			id = id || cryptoRandomString({ length: 6, type: 'url-safe' })

			await this.storage.db.table<StoredUrl>('urls').insert({ url, id })

			await this.storage.db
				.table<UrlInformation & { urlId: string }>('url_information')
				.insert({ urlId: id, ...urlInfo })

			const storedUrl = await this.get(id)
			return storedUrl
		}

		public async incVisitCount(id: string): Promise<void> {
			await this.storage.db
				.table<UrlInformation>('url_information')
				.where('url_id', '=', id)
				.increment('url_visit_count', 1)
		}

		public async incInfoCount(id: string): Promise<void> {
			await this.storage.db
				.table<UrlInformation>('url_information')
				.where('url_id', '=', id)
				.increment('info_visit_count', 1)
				.update({ lastUsed: new Date().toISOString() })
		}
	})(this)
}

import cryptoRandomString from 'crypto-random-string'
import Knex from 'knex'
import { join } from 'path'
import { NotFoundError } from '../../../../errors/notFound.js'
import type { StorageDriver } from '../../types'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import camelcaseKeys from 'camelcase-keys'
import { snakeCase } from 'snake-case'
import type { StoredUrl, UrlWithInformation, UrlRequestData, UrlInformation } from '../../types/url.js'
import { RelationalStorageConfig } from '../../types/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export class RelationalStorage implements StorageDriver {
	private db: Knex

	constructor(private config: RelationalStorageConfig) {
		this.db = Knex({
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
	}
	public async initialize(): Promise<void> {
		await this.upMigrations()
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
	url = new (class RelationalUrlStorage {
		constructor(public storage: RelationalStorage) {}

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
					.select('ip', 'url_visit_count', 'info_visit_count', 'last_used')
					.where('url_id', id)
					.join('urls', 'url_information.url_id', 'urls.id')
					.first()
			}
			if (!storedUrl) throw NotFoundError()
			return options.withInfo ? urlInfo : storedUrl
		}

		//All Info associated with that Urls also get deleted, automatically.
		//https://stackoverflow.com/questions/53859207/deleting-data-from-associated-tables-using-knex-js
		public async delete(id: string): Promise<void> {
			await this.storage.db.table<StoredUrl>('urls').where('id', id).delete()
		}

		public async deleteOverdue(timespanMs: number): Promise<number> {
			// const deleteBefore = new Date(new Date().getTime() - timespanMs)
			// return await this.storage.db.table<StoredUrl>('urls').where('updatedAt', '<', deleteBefore).delete()
			// TODO temporary fix
			return 0
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

		public async save(urlBody: UrlRequestData): Promise<StoredUrl> {
			const url = urlBody.url
			const urlInfo: UrlInformation = {
				ip: urlBody.ip,
				urlVisitCount: 0,
				infoVisitCount: 0,
				lastUsed: new Date().toISOString(),
			}

			if (!url) throw NotFoundError()
			const [storedUrl] = await this.storage.db.table<StoredUrl>('urls').insert({ url }).returning('*')
			await this.storage.db
				.table<UrlInformation & { urlId: string }>('url_information')
				.insert({ urlId: storedUrl.id, ...urlInfo })

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

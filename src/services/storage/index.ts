import { StorageConfig, StorageDriverName } from './types/config.js'
import type { StoredUrl, UrlRequestData, UrlWithInformation } from './types/url.js'
import type { StorageDriver } from './types/index.js'
import { InMemoryStorage } from './drivers/inMemory/index.js'
import { PostgresStorage } from './drivers/postgres/index.js'
import { InvalidConfigError, GeneralError, BASE_ERROR_NAME } from '../../errors/errors.js'
import { runWithRetries } from '../../helpers/runWithRetries.js'
import { logger } from '../logger/logger.js'
import { SqliteStorage } from './drivers/sqlite/index.js'
import { RedisStorage } from './drivers/redis/index.js'

export class Storage implements StorageDriver {
	_driver: StorageDriver
	_intervalToken?: NodeJS.Timeout

	constructor(private _config: StorageConfig) {
		switch (_config.driverName) {
			case StorageDriverName.InMemory:
				this._driver = new InMemoryStorage(_config)
				break
			case StorageDriverName.Postgres:
				this._driver = new PostgresStorage(_config)
				break
			case StorageDriverName.Sqlite:
				this._driver = new SqliteStorage(_config)
				break
			case StorageDriverName.Redis:
				this._driver = new RedisStorage(_config)
				break
			default:
				throw new InvalidConfigError(`Invalid url storage driver selected.`)
		}
	}
	get config(): StorageConfig {
		return this._config
	}
	get driver(): StorageDriver {
		return this._driver
	}
	public async initialize(): Promise<void> {
		try {
			logger.debug(`Running Storage.initialize`)
			// Waits for 1 minute (6 * 10,000ms) before failing
			await runWithRetries(this._driver.initialize.bind(this._driver), { retries: 6, retryTime: 10 * 1000 })
			await this.url.deleteOverdue(this.config.urlLifetimeMs)
			this._intervalToken = setInterval(
				() => this.url.deleteOverdue(this.config.urlLifetimeMs),
				this.config.cleanupIntervalMs,
			)
		} catch (err) {
			logger.error(`Storage.initialize failed: ${err}`)
			throw err
		}
	}
	public async shutdown(): Promise<void> {
		await this.driver.shutdown()
		if (this._intervalToken) clearInterval(this._intervalToken)
	}
	public async wipeData(options: { iUnderstandThatThisIsIrreversible: boolean }): Promise<void> {
		await this.driver.wipeData(options)
	}

	url = new (class UrlStorage {
		constructor(public storage: Storage) {}

		get driver() {
			return this.storage._driver
		}
		public async get(id: string, options = { withInfo: false }): Promise<StoredUrl | UrlWithInformation> {
			try {
				logger.debug(`Running Storage.url.get with ${id}`)
				return await this.driver.url.get(id, options)
			} catch (err) {
				logger.error(`Storage.url.get failed: ${err}`)
				if (err.name !== BASE_ERROR_NAME) throw new GeneralError('Could not get url')
				else throw err
			}
		}

		public async delete(id: string): Promise<void | number> {
			try {
				logger.debug(`Running Storage.url.delete with ${id}`)
				return await this.driver.url.delete(id)
			} catch (err) {
				logger.error(`Storage.url.delete failed: ${err}`)
				if (err.name !== BASE_ERROR_NAME) throw new GeneralError('Could not delete url')
				else throw err
			}
		}

		public async deleteOverdue(timespanMs: number): Promise<number> {
			try {
				logger.debug(`Running deleteOverdue with ${timespanMs}`)
				return await this.driver.url.deleteOverdue(timespanMs)
			} catch (err) {
				logger.error(`Storage.url.deleteOverdue failed: ${err}`)
				if (err.name !== BASE_ERROR_NAME) throw new GeneralError('Could not delete overdue urls')
				else throw err
			}
		}

		public async edit(id: string, url: string): Promise<StoredUrl> {
			try {
				logger.debug(`Running Storage.url.edit with ${id} and ${url}`)
				return await this.driver.url.edit(id, url)
			} catch (err) {
				logger.error(`Storage.url.edit failed: ${err}`)
				if (err.name !== BASE_ERROR_NAME) throw new GeneralError('Could not edit url')
				else throw err
			}
		}

		public async save(body: UrlRequestData): Promise<StoredUrl> {
			try {
				logger.debug(`Start Storage.url.save with ${JSON.stringify(body)}`)
				return await this.driver.url.save(body)
			} catch (err) {
				logger.error(`Storage.url.save failed: ${err}`)
				if (err.name !== BASE_ERROR_NAME) throw new GeneralError('Could not save url')
				else throw err
			}
		}

		public async incVisitCount(id: string): Promise<void> {
			try {
				logger.debug(`Start Storage.url.incVisitCount with id: ${id}`)
				return await this.driver.url.incVisitCount(id)
			} catch (err) {
				logger.error(`Storage.url.incVisitCount failed: ${err}`)
			}
		}

		public async incInfoCount(id: string): Promise<void> {
			try {
				logger.debug(`Start Storage.url.incInfoCount with id: ${id}`)
				return this.driver.url.incInfoCount(id)
			} catch (err) {
				logger.error(`Storage.url.incInfoCount failed: ${err}`)
			}
		}
	})(this)
}

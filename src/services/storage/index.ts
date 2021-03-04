import { StorageConfig, StorageDriverName } from './types/config.js'
import type { StoredUrl } from './types/url.js'
import type { StorageDriver } from './types/index.js'
import { InMemoryStorage } from './drivers/inMemory/index.js'
import { RelationalStorage } from './drivers/relational/index.js'
import { InvalidConfigError } from '../../errors/invalidConfig.js'
import { runWithRetries } from '../../helpers/runWithRetries.js'
import { logger } from '../logger/logger.js'
import { GeneralError } from '../../errors/generalError.js'

export class Storage implements StorageDriver {
	_driver: StorageDriver
	constructor(private _config: StorageConfig) {
		switch (_config.driverName) {
			case StorageDriverName.InMemory:
				this._driver = new InMemoryStorage(_config)
				break
			case StorageDriverName.Relational:
				this._driver = new RelationalStorage(_config)
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
		// Waits for 1 minute (6 * 10,000ms) before failing
		try {
			logger.debug(`Running Storage.initialize`)
			await runWithRetries(this._driver.initialize.bind(this._driver), { retries: 6, retryTime: 10 * 1000 })
		} catch (err) {
			logger.error(`Storage.initialize failed: ${err}`)
			throw err
		}
	}

	url = new (class UrlStorage {
		constructor(public storage: Storage) {}
		get driver() {
			return this.storage._driver
		}
		public async get(id: string): Promise<StoredUrl> {
			try {
				logger.debug(`Running Storage.url.get with ${id}`)
				return this.driver.url.get(id)
			} catch (err) {
				logger.error(`Storage.url.get failed: ${err}`)
				throw new GeneralError('Could not get (Storage.url.get)')
			}
		}
		public async delete(id: string): Promise<void> {
			try {
				logger.debug(`Running Storage.url.delete with ${id}`)
				return this.driver.url.delete(id)
			} catch (err) {
				logger.error(`Storage.url.delete failed: ${err}`)
				throw new GeneralError('Could not delete (Storage.url.delete)')
			}
		}
		public async deleteOverdue(timespanMs: number): Promise<number> {
			try {
				logger.debug(`Running deleteOverdue with ${timespanMs}`)
				return await this.driver.url.deleteOverdue(timespanMs)
			} catch (err) {
				logger.error(`Storage.url.deleteOverdue failed: ${err}`)
				throw GeneralError('Could not delete overdue')
			}
		}
		public async edit(id: string, url: string): Promise<StoredUrl> {
			try {
				logger.debug(`Running Storage.url.edit with ${id} and ${url}`)
				return this.driver.url.edit(id, url)
			} catch (err) {
				logger.error(`Storage.url.edit failed: ${err}`)
				throw new GeneralError('Could not edit (Storage.url.edit)')
			}
		}

		public async save(url: string): Promise<StoredUrl> {
			try {
				logger.debug(`Start Storage.url.save with ${url}`)
				return this.driver.url.save(url)
			} catch (err) {
				logger.error(`Storage.url.save failed: ${err}`)
				throw new GeneralError('Could not save url')
			}
		}
	})(this)
}

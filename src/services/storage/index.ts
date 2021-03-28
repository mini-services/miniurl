import { StorageConfig, StorageDriverName } from './types/config.js'
import type { StoredUrl, UrlRequestData, UrlWithInformation } from './types/url.js'
import type { StorageDriver } from './types/index.js'
import { InMemoryStorage } from './drivers/inMemory/index.js'
import { RelationalStorage } from './drivers/relational/index.js'
import { InvalidConfigError , GeneralError } from '../../errors/errors.js'
import { runWithRetries } from '../../helpers/runWithRetries.js'
import { logger } from '../logger/logger.js'

export class Storage implements StorageDriver {
	_driver: StorageDriver
	_intervalToken?: NodeJS.Timeout

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

	shutdown(): Promise<void> {
        throw new Error('Method not implemented.')
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
			await this.url.deleteOverdue(this.config.lifetimeMs)
			this._intervalToken = setInterval(
				() => this.url.deleteOverdue(this.config.lifetimeMs),
				this.config.cleanupIntervalMs,
			)
		} catch (err) {
			logger.error(`Storage.initialize failed: ${err}`)
			throw err
		}
	}
	public async shutdown(): Promise<void> {
		this.driver.shutdown()
		if (this._intervalToken) clearInterval(this._intervalToken)
	}

	url = new (class UrlStorage {
		constructor(public storage: Storage) { }

		get driver() {
			return this.storage._driver
		}
		public async get(id: string, options = { withInfo: false }): Promise<StoredUrl | UrlWithInformation> {
			try {
				logger.debug(`Running Storage.url.get with ${id}`)
				return await this.driver.url.get(id, options)
			} catch (err) {
				logger.error(`Storage.url.get failed: ${err}`)
				throw new GeneralError('Could not get url')
			}
		}

		public async delete(id: string): Promise<void> {
			try {
				logger.debug(`Running Storage.url.delete with ${id}`)
				return await this.driver.url.delete(id)
			} catch (err) {
				logger.error(`Storage.url.delete failed: ${err}`)
				throw new GeneralError('Could not delete url')
			}
		}

		public async deleteOverdue(timespanMs: number): Promise<number> {
			try {
				logger.debug(`Running deleteOverdue with ${timespanMs}`)
				return await this.driver.url.deleteOverdue(timespanMs)
			} catch (err) {
				logger.error(`Storage.url.deleteOverdue failed: ${err}`)
				throw GeneralError('Could not delete overdue urls')
			}
		}

		public async edit(id: string, url: string): Promise<StoredUrl> {
			try {
				logger.debug(`Running Storage.url.edit with ${id} and ${url}`)
				return await this.driver.url.edit(id, url)
			} catch (err) {
				logger.error(`Storage.url.edit failed: ${err}`)
				throw new GeneralError('Could not edit url')
			}
		}

		public async save(body: UrlRequestData): Promise<StoredUrl> {
			try {
				logger.debug(`Start Storage.url.save with url: ${body.url}, ip: ${body.ip}${body.id && `, id: ${body.id}`}`)
				return await this.driver.url.save(body)
			} catch (err) {
				logger.error(`Storage.url.save failed: ${err}`)
				throw new GeneralError('Could not save url')
			}
		}

		public async incVisitCount(id: string): Promise<void> {
			try {
				logger.debug(`Start Storage.url.incVisitCount with id: ${id}`)
				return await this.driver.url.incVisitCount(id)
			} catch (err) {
				logger.error(`Storage.url.incVisitCount failed: ${err}`)
				throw new GeneralError(`Could not increase visit count for url ${id}`)
			}
		}

		public async incInfoCount(id: string): Promise<void> {
			try {
				logger.debug(`Start Storage.url.incInfoCount with id: ${id}`)
				return this.driver.url.incInfoCount(id)
			} catch (err) {
				logger.error(`Storage.url.incInfoCount failed: ${err}`)
				throw new GeneralError(`Could not increase info count for url ${id}`)
			}
		}
	})(this)
}

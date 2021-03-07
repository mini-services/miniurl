import { StorageConfig, StorageDriverName } from './types/config.js'
import type { StoredUrl, UrlRequestData, UrlWithInformation } from './types/url.js'
import type { StorageDriver } from './types/index.js'
import { InMemoryStorage } from './drivers/inMemory/index.js'
import { RelationalStorage } from './drivers/relational/index.js'
import { InvalidConfigError } from '../../errors/invalidConfig.js'
import { runWithRetries } from '../../helpers/runWithRetries.js'
import { RedisStorage } from './drivers/redis/index.js'
import {RelationalStorageDriverConfig} from "./drivers/relational/types";
import {InMemoryStorageDriverConfig} from "./drivers/inMemory/types";
import {RedisStorageDriverConfig} from "./drivers/redis/types";

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
		// Waits for 1 minute (6 * 10,000ms) before failing
		await runWithRetries(this._driver.initialize.bind(this._driver), { retries: 6, retryTime: 10 * 1000 })
	}

	url = new (class UrlStorage {
		constructor(public storage: Storage) {}

		get driver() {
			return this.storage._driver
		}

		public async get(id: string, options = { withInfo: false }): Promise<StoredUrl | UrlWithInformation> {
			return this.driver.url.get(id, options)
		}

		public async delete(id: string): Promise<void | number> {
			return this.driver.url.delete(id)
		}

		public async deleteOverdue(timespanMs: number): Promise<number> {
			return this.driver.url.deleteOverdue(timespanMs)
		}

		public async edit(id: string, url: string): Promise<StoredUrl> {
			return this.driver.url.edit(id, url)
		}

		public async save(body: UrlRequestData): Promise<StoredUrl> {
			return this.driver.url.save(body)
		}

		public async incVisitCount(id: string): Promise<void> {
			return this.driver.url.incVisitCount(id)
		}

		public async incInfoCount(id: string): Promise<void> {
			return this.driver.url.incInfoCount(id)
		}
	})(this)
}

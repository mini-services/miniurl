import { StorageConfig, StorageDriverName } from './types/config.js'
import type { StoredUrl } from './types/url.js'
import type { StorageDriver } from './types/index.js'
import { InMemoryStorage } from './drivers/inMemory/index.js'
import { RelationalStorage } from './drivers/relational/index.js'
import { InvalidConfigError } from '../../errors/invalidConfig.js'

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
				throw new InvalidConfigError(`Invalid url storage driver selected. config: ${_config}`)
		}
	}
	get config(): StorageConfig {
		return this._config
	}
	get driver(): StorageDriver {
		return this._driver
	}
	public async initialize(): Promise<void> {
		await this._driver.initialize()
	}

	url = new (class UrlStorage {
		constructor(public storage: Storage) {}
		get driver() {
			return this.storage._driver
		}
		public async get(id: string): Promise<StoredUrl> {
			return this.driver.url.get(id)
		}
		public async delete(id: string): Promise<void> {
			return this.driver.url.delete(id)
		}
		public async edit(id: string, url: string): Promise<StoredUrl> {
			return this.driver.url.edit(id, url)
		}

		public async save(url: string): Promise<StoredUrl> {
			return this.driver.url.save(url)
		}
	})(this)
}

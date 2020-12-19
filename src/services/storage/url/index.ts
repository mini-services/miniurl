import { InvalidConfigError } from '../../../errors/invalidConfig.js'
import { InMemoryUrlStorage } from './drivers/inMemory/index.js'
import { InMemoryUrlStorageDriverConfig } from './drivers/inMemory/types'
import { PostgresUrlStorage } from './drivers/postgres/index.js'
import { PostgresUrlStorageDriverConfig } from './drivers/postgres/types'
import { UrlDriverConfig, UrlDriver, UrlStorageDriver, StoredUrl } from './types'

export class UrlStorage implements UrlStorageDriver {
	private _driverName: UrlDriver
	private _driver: UrlStorageDriver
	constructor(driverName: UrlDriver, driverConfig: UrlDriverConfig) {
		this._driverName = driverName

		if (driverName === 'InMemory') {
			this._driver = new InMemoryUrlStorage(driverConfig as InMemoryUrlStorageDriverConfig)
		} else if (driverName === 'Postgres') {
			this._driver = new PostgresUrlStorage(driverConfig as PostgresUrlStorageDriverConfig)
		} else throw new InvalidConfigError(`Invalid url storage driver selected: ${driverName}`)
	}
	public async initialize(): Promise<void> {
		return this._driver.initialize()
	}

	get driverName(): UrlDriver {
		return this._driverName
	}

	get driver(): UrlStorageDriver {
		return this._driver
	}

	public async get(id: string): Promise<StoredUrl> {
		return this._driver.get(id)
	}
	public async delete(id: string): Promise<void> {
		return this._driver.delete(id)
	}
	public async edit(id: string, url: string): Promise<StoredUrl> {
		return this._driver.edit(id, url)
	}

	public async save(url: string): Promise<StoredUrl> {
		return this._driver.save(url)
	}
}

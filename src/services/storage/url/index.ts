import { InvalidConfigError } from '../../../errors/invalidConfig'
import { InMemoryUrlStorage } from './drivers/inMemory'
import { InMemoryUrlStorageDriverConfig } from './drivers/inMemory/types'
import { UrlDriverConfig, UrlDriver, UrlStorageDriver } from './types'

export class UrlStorage implements UrlStorageDriver {
	private _driverName: UrlDriver
	private _driver: UrlStorageDriver
	constructor(driverName: UrlDriver, driverConfig: UrlDriverConfig) {
		this._driverName = driverName
		if (driverName === 'InMemory') {
			this._driver = new InMemoryUrlStorage(driverConfig as InMemoryUrlStorageDriverConfig)
		} else throw new InvalidConfigError('Invalid url storage driver selected')
	}

	get driverName(): UrlDriver {
		return this._driverName
	}

	get driver(): UrlStorageDriver {
		return this._driver
	}

	public async get(id: string): Promise<string> {
		return this._driver.get(id)
	}
	public async delete(id: string): Promise<string> {
		return this._driver.delete(id)
	}
	public async edit(id: string, url: string): Promise<string> {
		return this._driver.edit(id, url)
	}

	public async save(url: string): Promise<string> {
		return this._driver.save(url)
	}
}

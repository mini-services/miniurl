import { Config, StorageDriver } from './types'
import { UrlStorage } from './url/index.js'

export class Storage implements StorageDriver {
	url: UrlStorage
	constructor({ url }: Config) {
		this.url = new UrlStorage(url.driverName, url.driverConfig)
	}
	public async initialize(): Promise<void> {
		await this.url.initialize()
	}
}

import { Config, StorageDriver } from './types'
import { UrlStorage } from './url'

export class Storage implements StorageDriver {
	url
	constructor({ url }: Config) {
		this.url = new UrlStorage(url.driverName, url.driverConfig)
	}
}

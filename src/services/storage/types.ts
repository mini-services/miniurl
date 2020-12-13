import { UrlDriver, UrlDriverConfig, UrlStorageDriver } from './url/types'

export interface Config {
	url: { driverName: UrlDriver; driverConfig: UrlDriverConfig }
}

export interface StorageDriver {
	url: UrlStorageDriver
}

import type { UrlStorageDriver } from './url'

export interface StorageDriver {
	initialize(): Promise<void>
	url: UrlStorageDriver
}

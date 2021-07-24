import type { UrlStorageDriver } from './url'

export interface StorageDriver {
	initialize(): Promise<void>
	shutdown(): Promise<void>
	wipeData(options: { iUnderstandThatThisIsIrreversible: boolean }): Promise<void>

	url: UrlStorageDriver
}

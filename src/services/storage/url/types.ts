import { InMemoryUrlStorageDriverConfig } from './drivers/inMemory/types'

export type UrlDriverConfig = InMemoryUrlStorageDriverConfig

export interface UrlStorageDriver {
	get(id: string): Promise<string>
	save(url: string): Promise<string>
	edit(id: string, url: string): Promise<string>
	delete(id: string): Promise<string>
}

export type UrlDriver = 'InMemory'

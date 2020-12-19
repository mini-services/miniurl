import { InMemoryUrlStorageDriverConfig } from './drivers/inMemory/types'
import { PostgresUrlStorageDriverConfig } from './drivers/postgres/types'
export interface StoredUrl {
	id: string
	url: string
	createdAt: string
	updatedAt: string
}

export type UrlDriverConfig = InMemoryUrlStorageDriverConfig | PostgresUrlStorageDriverConfig

export interface UrlStorageDriver {
	initialize(): Promise<void>
	get(id: string): Promise<StoredUrl>
	save(url: string): Promise<StoredUrl>
	edit(id: string, url: string): Promise<StoredUrl>
	delete(id: string): Promise<void>
}

export type UrlDriver = 'InMemory' | 'Postgres'

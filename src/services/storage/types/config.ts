import type { InMemoryStorageDriverConfig } from '../drivers/inMemory/types'
import type { RelationalStorageDriverConfig } from '../drivers/relational/types'

export enum StorageDriverName {
	InMemory = 'InMemory',
	Relational = 'Relational',
}

export interface BaseConfig {
	appName: string
	lifetimeMs: number
	cleanupIntervalMs: number
	urlExpireFrom: string
}

export interface RelationalStorageConfig extends BaseConfig {
	driverName: StorageDriverName.Relational
	driverConfig: RelationalStorageDriverConfig
}

export interface InMemoryStorageConfig extends BaseConfig {
	driverName: StorageDriverName.InMemory
	driverConfig: InMemoryStorageDriverConfig
}

export type StorageConfig = RelationalStorageConfig | InMemoryStorageConfig

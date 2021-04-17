import type { InMemoryStorageDriverConfig } from '../drivers/inMemory/types'
import type { PostgresStorageDriverConfig } from '../drivers/postgres/types'

export enum StorageDriverName {
	InMemory = 'InMemory',
	Postgres = 'Postgres',
}

export interface BaseConfig {
	appName: string
	lifetimeMs: number
	cleanupIntervalMs: number
}

export interface PostgresStorageConfig extends BaseConfig {
	driverName: StorageDriverName.Postgres
	driverConfig: PostgresStorageDriverConfig
}

export interface InMemoryStorageConfig extends BaseConfig {
	driverName: StorageDriverName.InMemory
	driverConfig: InMemoryStorageDriverConfig
}

export type StorageConfig = PostgresStorageConfig | InMemoryStorageConfig

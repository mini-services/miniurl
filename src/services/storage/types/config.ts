import type { InMemoryStorageDriverConfig } from '../drivers/inMemory/types'
import type { PostgresStorageDriverConfig } from '../drivers/postgres/types'
import type { SqliteStorageDriverConfig } from '../drivers/sqlite/types'

export enum StorageDriverName {
	InMemory = 'InMemory',
	Postgres = 'Postgres',
	Sqlite = 'Sqlite',
}

export interface BaseConfig {
	appName: string
	urlLifetimeMs: number
	cleanupIntervalMs: number
}

export interface PostgresStorageConfig extends BaseConfig {
	driverName: StorageDriverName.Postgres
	driverConfig: PostgresStorageDriverConfig
}

export interface SqliteStorageConfig extends BaseConfig {
	driverName: StorageDriverName.Sqlite
	driverConfig: SqliteStorageDriverConfig
}

export interface InMemoryStorageConfig extends BaseConfig {
	driverName: StorageDriverName.InMemory
	driverConfig: InMemoryStorageDriverConfig
}

export type StorageConfig = PostgresStorageConfig | InMemoryStorageConfig | SqliteStorageConfig

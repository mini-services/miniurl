import type { InMemoryStorageDriverConfig } from '../drivers/inMemory/types'
import type { PostgresStorageDriverConfig } from '../drivers/postgres/types'
import type { SqliteStorageDriverConfig } from '../drivers/sqlite/types'
import type { RedisStorageDriverConfig } from '../drivers/redis/types'

export enum StorageDriverName {
	InMemory = 'InMemory',
	Postgres = 'Postgres',
	Sqlite = 'Sqlite',
	Redis = 'Redis',
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

export interface RedisStorageConfig extends BaseConfig {
	driverName: StorageDriverName.Redis
	driverConfig: RedisStorageDriverConfig
}

export type StorageConfig = PostgresStorageConfig | InMemoryStorageConfig | SqliteStorageConfig | RedisStorageConfig

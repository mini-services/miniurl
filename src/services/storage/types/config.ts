import Knex from 'knex'

export enum StorageDriverName {
	InMemory = 'InMemory',
	Relational = 'Relational',
}

export interface PostgresStorageDriverConfig extends Knex.Config {
	schemaName: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InMemoryStorageDriverConfig {}

export interface BaseConfig {
	appName: string
}

export interface RelationalStorageConfig extends BaseConfig {
	driverName: StorageDriverName.Relational
	driverConfig: PostgresStorageDriverConfig
}

export interface InMemoryStorageConfig extends BaseConfig {
	driverName: StorageDriverName.InMemory
	driverConfig: InMemoryStorageDriverConfig
}

export type StorageConfig = RelationalStorageConfig | InMemoryStorageConfig

import type { InMemoryStorageDriverConfig } from '../drivers/inMemory/types'
import type { RelationalStorageDriverConfig } from '../drivers/relational/types'

export enum StorageDriverName {
	InMemory = 'InMemory',
	Relational = 'Relational',
}

// // eslint-disable-next-line @typescript-eslint/no-empty-interface
// export interface RelationalStorageDriverConfig extends Knex.Config {}

// // eslint-disable-next-line @typescript-eslint/no-empty-interface
// export interface InMemoryStorageDriverConfig {}

export interface BaseConfig {
	appName: string
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

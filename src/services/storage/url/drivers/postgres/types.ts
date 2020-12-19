import Knex from 'knex'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PostgresUrlStorageDriverConfig extends Knex.Config {
	schemaName: string
}

import type Knex from 'knex'

export type PostgresStorageDriverConfig = { connection: Knex.PgConnectionConfig }

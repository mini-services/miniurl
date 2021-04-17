import type Knex from 'knex'

export type SqliteStorageDriverConfig = { connection: Knex.Sqlite3ConnectionConfig }

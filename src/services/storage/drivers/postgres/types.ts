import type Knex from 'knex'

export type PostgresStorageDriverConfig = { connection: Knex.PgConnectionConfig }

export interface CountersCache {
	visitCount: Record<string, number>
	infoCount: Record<string, number>
}

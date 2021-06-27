import type Knex from 'knex'

export type PostgresStorageDriverConfig = { connection: Knex.PgConnectionConfig }

export type ICounter = { [id: string]: number }

export interface ICountersCache {
	visitCount: ICounter
	infoCount: ICounter
}

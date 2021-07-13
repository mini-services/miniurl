import type Knex from 'knex'

export type PostgresStorageDriverConfig = { connection: Knex.PgConnectionConfig }

export type CountersCache = Record<
	string,
	{
		visitCount: number
		infoCount: number
	}
>

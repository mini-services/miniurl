import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.table('url_information', function (table) {
		table.string('request_url')
	})
}

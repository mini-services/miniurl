import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.table('url_information', function (table) {
		table.string('request_url')
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.table('url_information', function (table) {
		table.dropColumn('request_url')
	})
}

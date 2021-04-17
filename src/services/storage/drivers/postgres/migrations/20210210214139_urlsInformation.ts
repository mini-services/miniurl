import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('urls', function (table) {
		table.text('id').unique().alter()
	})
	await knex.schema.createTable('url_information', function (table) {
		table.text('url_id')
		table.foreign('url_id').references('id').inTable('urls').onDelete('CASCADE')
		table.string('ip')
		table.integer('url_visit_count')
		table.integer('info_visit_count')
		table.dateTime('last_used')
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('url_information')
	await knex.schema.alterTable('urls', function (table) {
		table.text('id').alter()
	})
}

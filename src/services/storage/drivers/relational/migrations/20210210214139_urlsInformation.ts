import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('url_information', function (table) {
		table.text('url_id')
		table.foreign('url_id').references('id').inTable('urls')
		table.string('ip')
		table.integer('url_visit_count')
		table.integer('info_visit_count')
		table.string('region')
		table.boolean('mobile')
		table.dateTime('last_use')
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('url_information')
}
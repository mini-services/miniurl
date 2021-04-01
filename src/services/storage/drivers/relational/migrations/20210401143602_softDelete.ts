import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.table('urls', table => {
    table.string('deletedAt');
  })

}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('urls', table => {
    table.dropColumn('deletedAt');
  })
}


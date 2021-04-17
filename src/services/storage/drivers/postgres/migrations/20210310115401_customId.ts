import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.raw(`
  DROP TRIGGER IF EXISTS on_new_url ON urls;
	CREATE OR REPLACE FUNCTION on_url_before_insert()
	RETURNS trigger
	LANGUAGE 'plpgsql'
		AS $BODY$
		BEGIN
      IF (NEW.id = '') IS NOT FALSE THEN
        NEW.id = stringify_bigint(pseudo_encrypt(NEW.serial));
      END IF;
			RETURN NEW;
			END;
		$BODY$;
	
	CREATE TRIGGER on_new_url
		BEFORE INSERT ON urls
		FOR EACH ROW
		EXECUTE PROCEDURE on_url_before_insert();`)
}

export async function down(knex: Knex): Promise<void> {
	await knex.raw(`
  DROP TRIGGER IF EXISTS on_new_url ON urls;
	CREATE OR REPLACE FUNCTION on_url_before_insert()
	RETURNS trigger
	LANGUAGE 'plpgsql'
		AS $BODY$
		BEGIN
			NEW.id = stringify_bigint(pseudo_encrypt(NEW.serial));
			RETURN NEW;
			END;
		$BODY$;
	
	CREATE TRIGGER on_new_url
		BEFORE INSERT ON urls
		FOR EACH ROW
		EXECUTE PROCEDURE on_url_before_insert();`)
}

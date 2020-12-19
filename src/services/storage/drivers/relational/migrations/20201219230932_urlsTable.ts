import Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
	// Based on http://wiki.postgresql.org/wiki/Pseudo_encrypt
	// And https://stackoverflow.com/questions/12575022/generating-an-instagram-or-youtube-like-unguessable-string-id-in-ruby-activerec/12590064#12590064
	await Promise.all([
		knex.raw(`
					CREATE FUNCTION pseudo_encrypt(value int) returns int AS $$
					DECLARE
					l1 int;
					l2 int;
					r1 int;
					r2 int;
					i int:=0;
					BEGIN
					l1:= (value >> 16) & 65535;
					r1:= value & 65535;
					WHILE i < 3 LOOP
					l2 := r1;
					r2 := l1 # ((((${process.env.MIGRATIONS_RANDOM_SEED_2} * r1 + ${process.env.MIGRATIONS_RANDOM_SEED_1}) % 714025) / 714025.0) * 32767)::int;
					l1 := l2;
					r1 := r2;
					i := i + 1;
					END LOOP;
					return ((r1 << 16) + l1);
					END;
					$$ LANGUAGE plpgsql strict immutable;`),
		knex.raw(`
						CREATE FUNCTION stringify_bigint(n bigint) RETURNS text
							LANGUAGE plpgsql IMMUTABLE STRICT AS $$
						DECLARE
							alphabet text:='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
							base int:=length(alphabet); 
							_n bigint:=abs(n);
							output text:='';
						BEGIN
							LOOP
								output := output || substr(alphabet, 1+(_n%base)::int, 1);
								_n := _n / base; 
								EXIT WHEN _n=0;
							END LOOP;
							RETURN output;
						END $$`),
	])
	await knex.schema.createTable('urls', function (table) {
		table.increments('serial')
		table.text('id')
		table.string('url')
		table.timestamps(true, true)
	})
	await knex.raw(`
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

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('urls')
	await knex.raw('DROP FUNCTION IF EXISTS on_url_before_insert')
	await Promise.all([
		knex.raw('DROP FUNCTION IF EXISTS pseudo_encrypt'),
		knex.raw('DROP FUNCTION IF EXISTS stringify_bigint'),
	])
}

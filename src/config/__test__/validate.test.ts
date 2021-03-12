import { validateConfig } from '../validate.js'
import test from 'ava'
import { InvalidConfigError } from '../../errors/invalidConfig.js'
import { StorageDriverName } from '../../services/storage/types/config.js'
import { AuthDriverName } from '../../services/auth/types/config.js'
import { logger } from '../../services/logger/logger.js'
import { getRawConfig } from './helpers.js'

test('validateBaseRedirectUrl properly validates baseRedirectUrl', (t) => {
	const config = getRawConfig()
	const invalidUrls = [
		{ url: '', message: 'Throws when the baseRedirectUrl does not exist' },
		{ url: 'blabla...', message: 'Throws when the baseRedirectUrl is not a valid url' },
		{ url: 'mock.com', message: 'Throws when the baseRedirectUrl has no protocol' },
		{ url: 'ftp://mock.com', message: 'Throws when the baseRedirectUrl has no supported protocol' },
		{
			url: `http://mock.com${config.apiPrefix}`,
			message: 'Throws when the baseRedirectUrl includes a reserved path',
		},
	]
	invalidUrls.forEach(({ url, message }) => {
		config.baseRedirectUrl = url
		t.throws(() => validateConfig(config), { instanceOf: InvalidConfigError }, message)
	})

	const validUrls = [
		{ url: 'https://mock.com', message: 'Allows for https' },
		{ url: 'http://mock.com', message: 'Allows for http' },
		{ url: 'http://mock.com', message: 'Works without a path' },
		{ url: 'http://mock.com/u/', message: 'Works with a path' },
	]

	validUrls.forEach(({ url, message }) => {
		config.baseRedirectUrl = url
		t.true(validateConfig(config), message)
	})
})

test('validateStorageDriver properly validates storage config', (t) => {
	const config = getRawConfig()
	const storageDriverOptions = Object.values(StorageDriverName)

	// Tests the driver types
	storageDriverOptions.forEach((storageDriverName) => {
		config.storage.driverName = storageDriverName
		t.true(validateConfig(config), `Accepts the ${storageDriverName} driver`)
	})

	// Tests the relational driver config
	config.storage.driverName = StorageDriverName.Relational

	// storage.relationalDriverConfig.client
	const originalClientValue = config.storage.relationalDriverConfig.client
	config.storage.relationalDriverConfig.client = ''
	t.throws(
		() => validateConfig(config),
		{ instanceOf: InvalidConfigError },
		`Throws when storage.relationalDriverConfig.client is empty`,
	)
	config.storage.relationalDriverConfig.client = originalClientValue

	// storage.relationalDriverConfig.connection
	;(Object.keys(
		config.storage.relationalDriverConfig.connection,
	) as (keyof typeof config['storage']['relationalDriverConfig']['connection'])[]).forEach((key) => {
		const originalValue = config.storage.relationalDriverConfig.connection[key]
		config.storage.relationalDriverConfig.connection[key] = ''

		t.throws(
			() => validateConfig(config),
			{ instanceOf: InvalidConfigError },
			`Throws when storage.relationalDriverConfig.connection.${key} is empty`,
		)

		config.storage.relationalDriverConfig.connection[key] = originalValue
	})
})

test('validateAuthDriver properly validates auth config', (t) => {
	const config = getRawConfig()
	const authDriverOptions = Object.values(AuthDriverName)

	// Tests the driver types
	authDriverOptions.forEach((authDriverName) => {
		config.auth.driverName = authDriverName
		t.true(validateConfig(config), `Accepts the ${authDriverName} driver`)
	})

	// Tests the bearerToken driver config
	config.auth.bearerTokenDriverConfig.token = ''
	t.throws(
		() => validateConfig(config),
		{ instanceOf: InvalidConfigError },
		`Throws when auth.bearerTokenDriverConfig.token is empty`,
	)
})

test('validateUrlLifetime', (t) => {
	const config = getRawConfig()

	config.url.lifetime = ''
	t.throws(() => validateConfig(config), { instanceOf: InvalidConfigError }, `Throws when url.lifetime is empty`)

	config.url.lifetime = 'nothing'
	t.throws(
		() => validateConfig(config),
		{ instanceOf: InvalidConfigError },
		`Throws when url.lifetime is not a valid ms time`,
	)

	config.url.lifetime = '-7 minutes'
	t.throws(() => validateConfig(config), { instanceOf: InvalidConfigError }, `Throws when url.lifetime is negative`)

	config.url.lifetime = '7 days'
	t.true(validateConfig(config), `Accepts a valid ms time`)
})

test('validateLogLevel', (t) => {
	const config = getRawConfig()

	config.logLevel = ''
	t.throws(() => validateConfig(config), { instanceOf: InvalidConfigError }, `Throws when logLevel is empty`)

	config.logLevel = 'not-valid'
	t.throws(
		() => validateConfig(config),
		{ instanceOf: InvalidConfigError },
		`Throws when logLevel is not a valid log level`,
	)

	Object.keys(logger.levels.values).forEach((logLevel) => {
		config.logLevel = logLevel
		t.true(validateConfig(config), `Accepts all valid log levels`)
	})
})

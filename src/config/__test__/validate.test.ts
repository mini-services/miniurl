import { validateConfig } from '../validate.js'
import { InvalidConfigError } from '../../errors/errors.js'
import { StorageDriverName } from '../../services/storage/types/config.js'
import { AuthDriverName } from '../../services/auth/types/config.js'
import { logger } from '../../services/logger/logger.js'
import { getMockRawConfig } from './helpers.js'

test('validateBaseRedirectUrl properly validates baseRedirectUrl', () => {
	const config = getMockRawConfig()
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
	invalidUrls.forEach(({ url }) => {
		config.baseRedirectUrl = url
		expect(() => validateConfig(config)).toThrowError(InvalidConfigError)
	})

	const validUrls = [
		{ url: 'https://mock.com', message: 'Allows for https' },
		{ url: 'http://mock.com', message: 'Allows for http' },
		{ url: 'http://mock.com', message: 'Works without a path' },
		{ url: 'http://mock.com/u/', message: 'Works with a path' },
	]

	validUrls.forEach(({ url }) => {
		config.baseRedirectUrl = url
		expect(validateConfig(config)).toBe(true)
	})
})

test('validateStorageDriver properly validates storage config', () => {
	const config = getMockRawConfig()
	const storageDriverOptions = Object.values(StorageDriverName)

	// Tests the driver types
	storageDriverOptions.forEach((storageDriverName) => {
		config.storage.driverName = storageDriverName
		expect(validateConfig(config)).toBe(true)
	})

	// Tests the postgres driver config
	config.storage.driverName = StorageDriverName.Postgres

	// storage.postgresDriverConfig.connection
	;(Object.keys(
		config.storage.postgresDriverConfig.connection,
	) as (keyof typeof config['storage']['postgresDriverConfig']['connection'])[]).forEach((key) => {
		const originalValue = config.storage.postgresDriverConfig.connection[key]
		config.storage.postgresDriverConfig.connection[key] = ''

		expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

		config.storage.postgresDriverConfig.connection[key] = originalValue
	})
})

test('validateAuthDriver properly validates auth config', () => {
	const config = getMockRawConfig()
	const authDriverOptions = Object.values(AuthDriverName)

	// Tests the driver types
	authDriverOptions.forEach((authDriverName) => {
		config.auth.driverName = authDriverName
		expect(validateConfig(config)).toBe(true)
	})

	// Tests the bearerToken driver config
	config.auth.bearerTokenDriverConfig.token = ''
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)
})

test('validateUrlLifetime', () => {
	const config = getMockRawConfig()

	config.url.lifetime = ''
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

	config.url.lifetime = 'nothing'
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

	config.url.lifetime = '-7 minutes'
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

	config.url.lifetime = '7 days'
	expect(validateConfig(config)).toBe(true)
})

test('validateLogLevel', () => {
	const config = getMockRawConfig()

	config.logLevel = ''
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

	config.logLevel = 'not-valid'
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

	Object.keys(logger.levels.values).forEach((logLevel) => {
		config.logLevel = logLevel
		expect(validateConfig(config)).toBe(true)
	})
})

import { validateConfig } from '../validate.js'
import { InvalidConfigError } from '../../errors/invalidConfig.js'
import { StorageDriverName } from '../../services/storage/types/config.js'
import { AuthDriverName } from '../../services/auth/types/config.js'
import { logger } from '../../services/logger/logger.js'
import { getRawConfig } from './helpers.js'

test('validateBaseRedirectUrl properly validates baseRedirectUrl', () => {
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
	const config = getRawConfig()
	const storageDriverOptions = Object.values(StorageDriverName)

	// Tests the driver types
	storageDriverOptions.forEach((storageDriverName) => {
		config.storage.driverName = storageDriverName
		expect(validateConfig(config)).toBe(true)
	})

	// Tests the relational driver config
	config.storage.driverName = StorageDriverName.Relational

	// storage.relationalDriverConfig.client
	const originalClientValue = config.storage.relationalDriverConfig.client
	config.storage.relationalDriverConfig.client = ''
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)
	config.storage.relationalDriverConfig.client = originalClientValue

	// storage.relationalDriverConfig.connection
	;(Object.keys(
		config.storage.relationalDriverConfig.connection,
	) as (keyof typeof config['storage']['relationalDriverConfig']['connection'])[]).forEach((key) => {
		const originalValue = config.storage.relationalDriverConfig.connection[key]
		config.storage.relationalDriverConfig.connection[key] = ''

		expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

		config.storage.relationalDriverConfig.connection[key] = originalValue
	})
})

test('validateAuthDriver properly validates auth config', () => {
	const config = getRawConfig()
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
	const config = getRawConfig()

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
	const config = getRawConfig()

	config.logLevel = ''
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

	config.logLevel = 'not-valid'
	expect(() => validateConfig(config)).toThrowError(InvalidConfigError)

	Object.keys(logger.levels.values).forEach((logLevel) => {
		config.logLevel = logLevel
		expect(validateConfig(config)).toBe(true)
	})
})

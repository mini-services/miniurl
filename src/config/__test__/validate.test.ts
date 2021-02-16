import { validateConfig } from '../validate.js'
import test from 'ava'
import { RawConfig } from '../types.js'
import { InvalidUrl } from '../../errors/invalidUrl.js'
import { config } from '../index.js'
import { InvalidConfigError } from '../../errors/invalidConfig.js'

function getConfig(): RawConfig {
	return {
		port: 'mock-port',
		appName: 'mini-test',
		baseRedirectUrl: 'http://mock.com',
		url: {
			matchPattern: 'mock-patter',
			lifetime: '120',
		},
		storage: {
			driverName: 'InMemory',
			relationalDriverConfig: {
				client: 'mock-client',
				connection: {
					host: 'local-host',
					user: 'snir-hamair',
					password: 'admin1234',
					database: 'mock-db',
				},
			},
		},
	}
}
test('validate config - happy flow [configuration set propely]', (t) => {
	t.is(validateConfig(getConfig()), true)
})

test('validateConfig throws if an invalid baseRedirectUrl is given- validateBaseRedirectUrl function works properly', (t) => {
	const config = getConfig()
	const invalidUrls = [
		{ url: 'mock.com', message: 'Throws when the baseRedirectUrl has no protocol' },
		{ url: 'blabla...', message: 'Throws when the baseRedirectUrl is not valid' },
		{ url: '', message: 'Throws when the baseRedirectUrl is empty' },
		{ url: `http://mock.com/${config.appName}`, message: 'Throws when the baseRedirectUrl includes reserved path' },
	]

	invalidUrls.forEach(({ url, message }) => {
		config.baseRedirectUrl = url
		t.throws(() => (validateConfig(config), { instanceOf: InvalidConfigError }, message))
	})
})

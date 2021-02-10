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

test('Making sure that validateConfig throws if an invalid baseRedirectUrl is given', (t) => {
	const invalidUrls = [
		{ url: 'mock.com', message: 'Throws when the baseRedirectUrl has no protocol' }, //test passes
		{ url: 'blabla...', message: 'Throws when the baseRedirectUrl is not valid' }, //test passes
		{ url: '', message: 'Throws when the baseRedirectUrl is empty' }, //test passes
	]

	invalidUrls.forEach(({ url, message }) => {
		const config = getConfig()
		config.baseRedirectUrl = url
		t.throws(() => (validateConfig(config), { instanceOf: InvalidConfigError }, message)) //success- test passed
	})
})
test('Making sure that validateConfig runs if a valid baseRedirectUrl is given', (t) => {
	const config = getConfig()
	config.baseRedirectUrl = 'http://google.com'
	t.is(validateConfig(config), true)
})

test('Making sure that validateConfig throws if an illegal path is entered', (t) => {
	const config = getConfig()
	config.baseRedirectUrl = 'http://mock.com/mini-test'
	t.throws(
		() => (
			validateConfig(config), { instanceOf: InvalidConfigError }, 'Throws if a reserved path is illegally given'
		),
	)
})

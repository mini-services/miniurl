import { validateConfig } from '../validate.js'
import test from 'ava'
import { RawConfig } from '../types.js'

const config: RawConfig = {
	port: 'mock-port',
	appName: 'mini-test',
	apiPrefix: '/miniurl',
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

test('validate config - happy flow [configuration set propely]', (t) => {
	t.is(validateConfig(config), true)
})

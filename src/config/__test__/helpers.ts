import { RawConfig } from '../types'

export function getRawConfig(): RawConfig {
	return {
		port: 'mock-port',
		logLevel: 'debug',
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
			redisDriverConfig: {
				port: '6379',
				host: 'runRemotely',
				username: 're-this',
				password: 're-that',
				connectTimeout: '10000',
			},
		},
		auth: {
			driverName: 'BearerToken',
			bearerTokenDriverConfig: {
				token: '123',
			},
		},
	}
}

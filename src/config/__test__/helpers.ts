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
			driverName: 'Redis',
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
				connectTimeout: '1000',
				host: 'localhost',
				port: '6379',
				password: 'pass',
				username: 'user',
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

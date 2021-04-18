import { AuthDriverName } from '../../services/auth/types/config'
import { StorageDriverName } from '../../services/storage/types/config'
import { Config, RawConfig } from '../types'

export function getMockRawConfig(): RawConfig {
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
			postgresDriverConfig: {
				connection: {
					host: 'local-host',
					user: 'snir-hamair',
					password: 'admin1234',
					database: 'mock-db',
				},
			},
			sqliteDriverConfig: {
				connection: {
					filename: './db.sqlite',
				},
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

import { Config } from '../types'
import { AuthDriverName } from '../../services/auth/types/config'
import { StorageDriverName } from '../../services/storage/types/config'

export function mockGetConfig(): Config {
	return {
		port: '80',
		logLevel: 'debug',
		apiPrefix: '/miniurl',
		appName: 'miniurl',
		url: {
			matchPattern: '**',
			lifetimeMs: 6 * 24 * 60 * 60 * 1000,
			cleanupIntervalMs: 24 * 60 * 60 * 1000,
		},
		baseRedirectUrl: 'http://mock.com/',
		storage: {
			appName: 'miniurl',
			urlLifetimeMs: 6 * 24 * 60 * 60 * 1000,
			cleanupIntervalMs: 24 * 60 * 60 * 1000,
			driverName: StorageDriverName.InMemory,
			driverConfig: {},
		},
		auth: {
			driverName: AuthDriverName.BearerToken,
			driverConfig: {
				token: '123',
			},
		},
	}
}

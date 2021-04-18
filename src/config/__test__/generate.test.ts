import ms from 'ms'
import { AuthDriverName } from '../../services/auth/types/config'
import { generateConfig } from '../generate'

test('generateConfig', () => {
	process.env.PORT = '3001'
	process.env.LOG_LEVEL = 'info'
	process.env.API_PREFIX = '/api-prefix'
	process.env.BASE_REDIRECT_URL = 'https://localhost:3001/'
	process.env.URL_MATCH_PATTERN = '/my-pattern*'
	process.env.URL_LIFETIME = '6 days'
	process.env.STORAGE_DRIVER = 'Sqlite'
	process.env.SQLITE_STORAGE_FILENAME = './db.sqlite'
	process.env.AUTH_DRIVER = ''
	process.env.AUTH_BEARER_TOKEN = ''

	const config = generateConfig()

	expect(config.auth.driverConfig?.token).toBeTruthy()

	expect(config).toEqual({
		port: process.env.PORT,
		logLevel: process.env.LOG_LEVEL,
		apiPrefix: process.env.API_PREFIX,
		appName: 'miniurl',
		baseRedirectUrl: process.env.BASE_REDIRECT_URL,
		url: {
			lifetimeMs: ms(process.env.URL_LIFETIME),
			matchPattern: process.env.URL_MATCH_PATTERN,
			cleanupIntervalMs: config.url.cleanupIntervalMs, // We're not yet testing this
		},
		storage: {
			appName: 'miniurl',
			urlLifetimeMs: ms(process.env.URL_LIFETIME),
			cleanupIntervalMs: config.url.cleanupIntervalMs, // We're not yet testing this
			driverName: process.env.STORAGE_DRIVER,
			driverConfig: { connection: { filename: process.env.SQLITE_STORAGE_FILENAME } },
		},
		auth: {
			driverName: AuthDriverName.BearerToken,
			driverConfig: config.auth.driverConfig, // Already tested above
		},
	})
})

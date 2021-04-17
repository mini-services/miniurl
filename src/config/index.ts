import cryptoRandomString from 'crypto-random-string'
import { InvalidConfigError } from '../errors/errors.js'
import { AuthDriverName } from '../services/auth/types/config.js'
import { normalizeConfig } from './normalize.js'
import type { RawConfig, Config } from './types.js'
import { validateConfig } from './validate.js'
import { logger } from '../services/logger/logger.js'

// Get config from environment variables
const rawConfig: RawConfig = {
	port: process.env.PORT || '80',
	logLevel: process.env.LOG_LEVEL || 'info',
	appName: process.env.npm_package_name || 'miniurl',
	apiPrefix: process.env.API_PREFIX || '/miniurl',
	baseRedirectUrl: process.env.BASE_REDIRECT_URL || '',
	url: {
		matchPattern: process.env.URL_MATCH_PATTERN || '**',
		lifetime: process.env.URL_LIFETIME || '7 days',
	},
	storage: {
		driverName: process.env.STORAGE_DRIVER || '',
		postgresDriverConfig: {
			connection: {
				host: process.env.POSTGRES_STORAGE_HOST || '',
				user: process.env.POSTGRES_STORAGE_USER || '',
				password: process.env.POSTGRES_STORAGE_PASSWORD || '',
				database: process.env.POSTGRES_STORAGE_DATABASE || '',
			},
		},
		sqliteDriverConfig: {
			connection: {
				filename: process.env.SQLITE_STORAGE_FILENAME || './db.sqlite',
			},
		},
	},
	auth: {
		driverName: process.env.AUTH_DRIVER || '',
		bearerTokenDriverConfig: {
			token: process.env.AUTH_BEARER_TOKEN || '',
		},
	},
}

// In order to support the Postgres driver's older name
if (rawConfig.storage.driverName === 'Relational') rawConfig.storage.driverName = 'Postgres'

if (!rawConfig.auth.driverName) {
	logger.warn(`No auth driver selected.
	    A default BearerToken driver is selected and a random bearer token will be generated.`)

	rawConfig.auth.driverName = AuthDriverName.BearerToken
	rawConfig.auth.bearerTokenDriverConfig.token = cryptoRandomString({ length: 18, type: 'alphanumeric' })
	logger.info(`Generated bearer token is '${rawConfig.auth.bearerTokenDriverConfig.token}'`)
}

if (!validateConfig(rawConfig)) {
	logger.error('Received config is invalid')
	throw new InvalidConfigError()
}
const config: Config = normalizeConfig(rawConfig)

export { config }

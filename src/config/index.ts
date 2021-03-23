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
		relationalDriverConfig: {
			client: process.env.RELATIONAL_STORAGE_CLIENT || '',
			connection: {
				host: process.env.RELATIONAL_STORAGE_HOST || '',
				user: process.env.RELATIONAL_STORAGE_USER || '',
				password: process.env.RELATIONAL_STORAGE_PASSWORD || '',
				database: process.env.RELATIONAL_STORAGE_DATABASE || '',
			},
		},

		redisDriverConfig: {
			port: process.env.REDIS_STORAGE_PORT || '',
			host: process.env.REDIS_STORAGE_HOST || '',
			username: process.env.REDIS_STORAGE_USERNAME || '',
			password: process.env.REDIS_STORAGE_PASSWORD || '',
			connectTimeout: process.env.REDIS_STORAGE_CONNECTION_TIMEOUT || '',
		},
	},
	auth: {
		driverName: process.env.AUTH_DRIVER || '',
		bearerTokenDriverConfig: {
			token: process.env.AUTH_BEARER_TOKEN || '',
		},
	},
}

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

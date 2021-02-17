import { InvalidConfigError } from '../errors/invalidConfig.js'
import { normalizeConfig } from './normalize.js'
import type { RawConfig, Config } from './types.js'
import { validateConfig } from './validate.js'

// Get config from environment variables
const rawConfig: RawConfig = {
	port: process.env.PORT || '80',
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
	},
}

if (!validateConfig(rawConfig)) throw new InvalidConfigError()
const config: Config = normalizeConfig(rawConfig)

export { config }

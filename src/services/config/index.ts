import { InvalidConfigError } from '../../errors/invalidConfig.js'
import { normalizeConfig } from './normalize.js'
import { RawConfig, Config } from './types.js'
import { validateConfig } from './validate.js'

// Get config from environment variables
const rawConfig: RawConfig = {
	port: process.env.PORT || '80',
	appName: process.env.npm_package_name || 'miniurl',
	baseRedirectUrl: process.env.BASE_REDIRECT_URL || '',
	storage: {
		driver: process.env.STORAGE_DRIVER || '',
		connection: {
			host: process.env.RELATIONAL_STORAGE_HOST || '',
			user: process.env.RELATIONAL_STORAGE_USER || '',
			password: process.env.RELATIONAL_STORAGE_PASSWORD || '',
			database: process.env.RELATIONAL_STORAGE_DATABASE || '',
		},
	},
}

if (!validateConfig(rawConfig)) throw new InvalidConfigError()
const config: Config = normalizeConfig(rawConfig)

export { config }

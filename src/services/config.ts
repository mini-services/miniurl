import { InvalidConfigError } from '../errors/invalidConfig.js'

// Get config from environment variables
const config = {
	port: process.env.PORT || '80',
	appName: process.env.npm_package_name || 'miniurl',
	baseRedirectUrl: process.env.BASE_REDIRECT_URL || '',
}

// Validate config
if (!config.baseRedirectUrl || !new URL(config.baseRedirectUrl)) {
	throw new InvalidConfigError('Must specify a valid BASE_REDIRECT_URL (including schema)')
}
if (new URL(config.baseRedirectUrl).pathname.startsWith(`/${config.appName}`)) {
	throw new InvalidConfigError(
		`BASE_REDIRECT_URL path must not start with /${config.appName} (this is a reserved route)`,
	)
}

export { config }

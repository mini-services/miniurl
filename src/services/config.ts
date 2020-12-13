import dotenvFlow from 'dotenv-flow'
import dotenvExpand from 'dotenv-expand'

import { InvalidConfigError } from '../errors/invalidConfig.js'

const dotenv = dotenvExpand(dotenvFlow.config())
if (dotenv.error || !dotenv.parsed) throw new InvalidConfigError(dotenv.error?.message)
const env = dotenv.parsed

// Get config from environment variables
const config = {
	port: env.PORT || '80',
	baseRedirectUrl: env.BASE_REDIRECT_URL,
}

// Validate config
if (!config.baseRedirectUrl || !new URL(config.baseRedirectUrl)) {
	throw new InvalidConfigError('Must specify a valid BASE_REDIRECT_URL (including schema)')
}
if (new URL(config.baseRedirectUrl).pathname.startsWith('/_')) {
	throw new InvalidConfigError('BASE_REDIRECT_URL path must not start with /_ (this is a reserved route) ')
}

export { config }

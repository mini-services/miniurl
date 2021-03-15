import ms from 'ms'
import { InvalidConfigError } from '../errors/errors.js'
import { StorageDriverName } from '../services/storage/types/config.js'
import { AuthDriverName } from '../services/auth/types/config.js'
import type { RawConfig } from './types.js'
import { logger } from '../services/logger/logger.js'

export function validateConfig(rawConfig: RawConfig): boolean {
	logger.debug(`Start validateConfig`)
	validateBaseRedirectUrl(rawConfig.baseRedirectUrl, rawConfig.apiPrefix)
	validateStorageDriver(rawConfig.storage)
	validateAuthDriver(rawConfig.auth)
	validateUrlLifetime(rawConfig.url.lifetime)
	validateLogLevel(rawConfig.logLevel)

	return true
}

function validateStorageDriver(storage: RawConfig['storage']): void {
	logger.debug(`Start config.validateStorageDriver`)
	const storageOptions = Object.values(StorageDriverName)
	if (!storage.driverName || !storageOptions.includes(storage.driverName as StorageDriverName)) {
		throw new InvalidConfigError(
			`Must specify a valid STORAGE_DRIVER (available options are ${storageOptions.join(', ')})`,
		)
	}

	if (storage.driverName === StorageDriverName.Relational) {
		const { client, connection } = storage.relationalDriverConfig
		if (!(client && connection.host && connection.user && connection.password && connection.database)) {
			throw new InvalidConfigError(
				`When using Relational storage driver you must specify RELATIONAL_STORAGE_CLIENT,
													RELATIONAL_STORAGE_HOST,
													RELATIONAL_STORAGE_USER,
													RELATIONAL_STORAGE_PASSWORD,
													RELATIONAL_STORAGE_DATABASE`,
			)
		}
	}

	if (storage.driverName === StorageDriverName.Redis) {
		const {port, host, username, password, connectTimeout} = storage.redisDriverConfig
		if (!(port || host)) {
			throw new InvalidConfigError(
				'When using Redis driver you must specify REDIS_STORAGE_HOST,REDIS_STORAGE_PORT',
			)
		}
		if ((!username && password) || (username && !password)) {
			throw new InvalidConfigError(
				'When specify REDIS_STORAGE_USERNAME you must specify also REDIS_STORAGE_PASSWORD and vice versa',
			)
		}
		if (!connectTimeout) {
			throw new InvalidConfigError(
				'When using Redis driver you must specify REDIS_STORAGE_CONNECTION_TIMEOUT(ms)',
			)
		}
		if (host === 'localhost') {
			logger.warn('You are in developer mode, Redis DB will run locally')
		}
	}
}

function validateAuthDriver(auth: RawConfig['auth']): void {
	logger.debug(`Start config.validateAuthDriver`)
	const authOptions = Object.values(AuthDriverName)
	if (!auth.driverName || !authOptions.includes(auth.driverName as AuthDriverName)) {
		throw new InvalidConfigError(
			`Must specify a valid AUTH_DRIVER (available options are ${authOptions.join(', ')})`,
		)
	}

	if (auth.driverName === AuthDriverName.BearerToken) {
		const { token } = auth.bearerTokenDriverConfig
		if (!token) {
			throw new InvalidConfigError(
				`When using 'BearerToken' auth driver you must specify a token (AUTH_BEARER_TOKEN)`,
			)
		}
	}
}

function validateBaseRedirectUrl(baseRedirectUrl?: string, apiPrefix?: string): void {
	logger.debug(`Start validateBaseRedirectUrl with ${baseRedirectUrl} and ${apiPrefix}`)
	// Exists
	if (!baseRedirectUrl) {
		throw new InvalidConfigError(`Must specify a BASE_REDIRECT_URL (received '${baseRedirectUrl}').`)
	}

	// Is a valid URL
	let url: URL
	try {
		url = new URL(baseRedirectUrl)
	} catch {
		throw new InvalidConfigError(
			`Must specify a valid BASE_REDIRECT_URL (including protocol). instead received '${baseRedirectUrl}'.`,
		)
	}

	// Has a supported protocol
	const validProtocols = ['http', 'https']
	const protocol = url.protocol.slice(0, url.protocol.length - 1)
	if (!validProtocols.includes(url.protocol.slice(0, url.protocol.length - 1))) {
		throw new InvalidConfigError(
			`BASE_REDIRECT_URL must have a valid protocol (${validProtocols.join('/')}).\
			instead received '${protocol}'.`,
		)
	}

	// Does not start with a reserved path
	const reservedApiRoute = apiPrefix?.startsWith('/') ? apiPrefix : `/${apiPrefix}`
	if (new URL(baseRedirectUrl).pathname.startsWith(reservedApiRoute)) {
		throw new InvalidConfigError(
			`BASE_REDIRECT_URL path must not start with ${reservedApiRoute} (this is a reserved route)`,
		)
	}
}

function validateUrlLifetime(urlLifetime: string): void {
	logger.debug(`Start validateUrlLifetime with ${urlLifetime}`)
	if (!urlLifetime || !ms(urlLifetime) || ms(urlLifetime) <= 0) {
		throw new InvalidConfigError(`URL_LIFETIME specified is invalid (received ${urlLifetime})`)
	}
}

function validateLogLevel(logLevel: string) {
	logger.debug(`Start validateLogLevel with ${logLevel}`)
	const levelValues = Object.keys(logger.levels.values)
	if (!levelValues.includes(logLevel)) {
		throw new InvalidConfigError(`Must specify a valid LOG_LEVEL (available options are ${levelValues.join(', ')})`)
	}
}

import ms from 'ms'
import { InvalidConfigError } from '../errors/invalidConfig.js'
import { StorageDriverName } from '../services/storage/types/config.js'
import { AuthDriverName } from '../services/auth/types/config.js'
import type { RawConfig } from './types.js'

export function validateConfig(rawConfig: RawConfig): boolean {
	validateBaseRedirectUrl(rawConfig.baseRedirectUrl, rawConfig.apiPrefix)
	validateStorageDriver(rawConfig.storage)
	validateAuthDriver(rawConfig.auth)
	validateUrlLifetime(rawConfig.url.lifetime)

	return true
}
function validateStorageDriver(storage: RawConfig['storage']): void {
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
}
function validateAuthDriver(auth: RawConfig['auth']): void {
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
	// Exists
	if (!baseRedirectUrl || !new URL(baseRedirectUrl)) {
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
	if (!urlLifetime || !ms(urlLifetime) || ms(urlLifetime) <= 0) {
		throw new InvalidConfigError(`URL_LIFETIME specified is invalid (received ${urlLifetime})`)
	}
}

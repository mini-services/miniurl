import ms from 'ms'
import { InvalidConfigError } from '../errors/invalidConfig'
import { StorageDriverName } from '../services/storage/types/config'
import type { RawConfig } from './types'

export function validateConfig(rawConfig: RawConfig): boolean {
	validateBaseRedirectUrl(rawConfig.baseRedirectUrl, rawConfig.appName)
	validateStorageDriver(rawConfig.storage)
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
				`Relational storage driver must receive RELATIONAL_STORAGE_CLIENT,
									RELATIONAL_STORAGE_HOST,
									RELATIONAL_STORAGE_USER,
									RELATIONAL_STORAGE_PASSWORD,
									RELATIONAL_STORAGE_DATABASE`,
			)
		}
	}
}

function validateBaseRedirectUrl(baseRedirectUrl?: string, appName?: string): void {
	if (!baseRedirectUrl || !new URL(baseRedirectUrl)) {
		throw new InvalidConfigError('Must specify a valid BASE_REDIRECT_URL (including schema)')
	}
	if (new URL(baseRedirectUrl).pathname.startsWith(`/${appName}`)) {
		throw new InvalidConfigError(
			`BASE_REDIRECT_URL path must not start with /${appName} (this is a reserved route)`,
		)
	}
}

function validateUrlLifetime(urlLifetime: string): void {
	if (!urlLifetime || !ms(urlLifetime)) {
		throw new InvalidConfigError('URL_LIFETIME specified is invalid')
	}
}

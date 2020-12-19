import { InvalidConfigError } from '../../errors/invalidConfig'
import { StorageDriverName } from '../storage/types'
import { RawConfig } from './types'

export function validateConfig(rawConfig: RawConfig): boolean {
	validateBaseRedirectUrl(rawConfig.baseRedirectUrl, rawConfig.appName)
	validateStorageDriver(rawConfig.storageDriver)

	return true
}
function validateStorageDriver(storageDriver?: string): void {
	const storageOptions = Object.values(StorageDriverName)
	if (!storageDriver || !storageOptions.includes(storageDriver as StorageDriverName)) {
		throw new InvalidConfigError(`Must specify a valid STORAGE_DRIVER (available options are ${storageOptions})`)
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

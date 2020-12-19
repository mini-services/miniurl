import { StorageDriverName } from '../storage/types/config.js'
import type { RawConfig, Config } from './types.js'

export function normalizeConfig(config: RawConfig): Config {
	if (!config.baseRedirectUrl.endsWith('/')) config.baseRedirectUrl += '/'

	return {
		...config,
		storage: {
			driverName: config.storage.driverName as StorageDriverName,
			driverConfig:
				config.storage.driverName === StorageDriverName.Relational ? config.storage.relationalDriverConfig : {},
		},
	}
}

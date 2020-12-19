import { StorageDriverName } from '../storage/types'
import { RawConfig, Config } from './types'

export function normalizeConfig(config: RawConfig): Config {
	if (!config.baseRedirectUrl.endsWith('/')) config.baseRedirectUrl += '/'
	return {
		...config,
		storageDriver: config.storageDriver as StorageDriverName,
	}
}

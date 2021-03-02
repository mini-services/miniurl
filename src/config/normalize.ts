import { StorageDriverName } from '../services/storage/types/config.js'
import ms from 'ms'
import type { RawConfig, Config } from './types.js'
import {
	MAX_URL_CLEANUP_INTERVAL_MS,
	MIN_URL_CLEANUP_INTERVAL_MS,
	URL_CLEANUP_INTERVAL_MAX_ERROR_RATIO,
} from './consts.js'
import { AuthDriverName } from '../services/auth/types/config.js'

export function normalizeConfig(config: RawConfig): Config {
	if (!config.baseRedirectUrl.endsWith('/')) config.baseRedirectUrl += '/'

	// Use a ratio for the ideal cleanup interval
	const idealCleanupInterval = ms(config.url.lifetime) * URL_CLEANUP_INTERVAL_MAX_ERROR_RATIO
	// No less than the minimum
	const minimumCleanupTime = Math.max(idealCleanupInterval, MIN_URL_CLEANUP_INTERVAL_MS)
	// No more than the maximum
	const cleanupIntervalMs = Math.min(minimumCleanupTime, MAX_URL_CLEANUP_INTERVAL_MS)

	return {
		...config,
		url: {
			lifetimeMs: ms(config.url.lifetime),
			matchPattern: config.url.matchPattern,
			cleanupIntervalMs,
		},
		storage: {
			driverName: config.storage.driverName as StorageDriverName,
			driverConfig:
				config.storage.driverName === StorageDriverName.Relational ? config.storage.relationalDriverConfig : {},
		},
		auth: {
			driverName: config.auth.driverName as AuthDriverName,
			driverConfig: config.auth.bearerTokenDriverConfig,
		},
	}
}

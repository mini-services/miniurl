import { StorageConfig, StorageDriverName } from '../services/storage/types/config.js'
import ms from 'ms'
import type { RawConfig, Config } from './types.js'
import {
	MAX_URL_CLEANUP_INTERVAL_MS,
	MIN_URL_CLEANUP_INTERVAL_MS,
	URL_CLEANUP_INTERVAL_MAX_ERROR_RATIO,
} from './consts.js'
import { AuthDriverName } from '../services/auth/types/config.js'

export function normalizeConfig({
	baseRedirectUrl,
	port,
	logLevel,
	apiPrefix,
	appName,
	url,
	storage,
	auth,
}: RawConfig): Config {
	if (!baseRedirectUrl.endsWith('/')) baseRedirectUrl += '/'

	// Use a ratio for the ideal cleanup interval
	const idealCleanupInterval = ms(url.lifetime) * URL_CLEANUP_INTERVAL_MAX_ERROR_RATIO
	// No less than the minimum
	const minimumCleanupTime = Math.max(idealCleanupInterval, MIN_URL_CLEANUP_INTERVAL_MS)
	// No more than the maximum
	const cleanupIntervalMs = Math.min(minimumCleanupTime, MAX_URL_CLEANUP_INTERVAL_MS)

	const urlLifetimeMs = ms(url.lifetime)

	const storageConfig = getStorageDriverConfig(storage, { appName, urlLifetimeMs, cleanupIntervalMs })
	return {
		port,
		logLevel,
		apiPrefix,
		appName,
		baseRedirectUrl,
		url: {
			lifetimeMs: urlLifetimeMs,
			matchPattern: url.matchPattern,
			cleanupIntervalMs,
		},
		storage: storageConfig,
		auth: {
			driverName: auth.driverName as AuthDriverName,
			driverConfig: auth.bearerTokenDriverConfig,
		},
	}
}

function getStorageDriverConfig(
	storage: RawConfig['storage'],
	extras: { appName: string; urlLifetimeMs: number; cleanupIntervalMs: number },
): StorageConfig {
	const { Postgres, Sqlite, InMemory, Redis } = StorageDriverName
	if (storage.driverName === Postgres) {
		return {
			driverName: Postgres,
			driverConfig: storage.postgresDriverConfig,
			...extras,
		}
	} else if (storage.driverName === Sqlite) {
		return {
			driverName: Sqlite,
			driverConfig: storage.sqliteDriverConfig,
			...extras,
		}
	} else if (storage.driverName === Redis) {
		return {
			driverName: Redis,
			driverConfig: storage.redisDriverConfig,
			...extras,
		}
	} else {
		return {
			driverName: InMemory,
			driverConfig: {},
			...extras,
		}
	}
}

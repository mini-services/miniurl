import { StorageDriverName } from '../services/storage/types/config.js'
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
	const redisDriverConfig = {
		port: +storage.redisDriverConfig.port,
		host: storage.redisDriverConfig.host,
		username: storage.redisDriverConfig.username,
		password: storage.redisDriverConfig.password,
		connectTimeout: +storage.redisDriverConfig.connectTimeout,
	}

	const storageDriverConfig =
		storage.driverName === StorageDriverName.Relational
			? storage.relationalDriverConfig
			: storage.driverName === StorageDriverName.Redis
			? redisDriverConfig
			: {}

	const urllifetimeMs = ms(url.lifetime)
	return {
		port,
		redisDriverConfig,
		logLevel,
		apiPrefix,
		appName,
		baseRedirectUrl,
		url: {
			lifetimeMs: urllifetimeMs,
			matchPattern: url.matchPattern,
			cleanupIntervalMs,
		},
		storage: {
			appName,
			urllifetimeMs,
			driverName: storage.driverName as StorageDriverName,
			driverConfig: storageDriverConfig,
		},
		auth: {
			driverName: auth.driverName as AuthDriverName,
			driverConfig: auth.bearerTokenDriverConfig,
		},
	}
}

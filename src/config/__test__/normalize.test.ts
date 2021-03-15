import test from 'ava'
import ms from 'ms'
import {RedisStorageConfig, StorageDriverName} from '../../services/storage/types/config.js'
import { normalizeConfig } from '../normalize.js'
import { getRawConfig } from './helpers.js'
import isNumberObject = module
import module from "module"

test('Happy flow', (t) => {
	const rawConfig = getRawConfig()
	const { port, logLevel, apiPrefix, appName, baseRedirectUrl, url, storage, auth } = rawConfig

	const config = normalizeConfig(rawConfig)

	// Checks that the baseRedirectUrl is unchanged and ends with a '/'
	t.true(config.baseRedirectUrl.endsWith('/'), 'baseRedirectUrl ends with "/"')
	t.true(
		baseRedirectUrl === config.baseRedirectUrl || baseRedirectUrl + '/' === config.baseRedirectUrl,
		'baseRedirectUrl is unchanged except for the trailing slash',
	)
	t.true(
		+storage.redisDriverConfig.port === config.redisDriverConfig.port &&
			+storage.redisDriverConfig.connectTimeout === config.redisDriverConfig.connectTimeout,
		'port and connectTimeout values changed from string to number',
	)

	t.like(config, {
		port,
		logLevel,
		apiPrefix,
		appName,
		baseRedirectUrl: config.baseRedirectUrl, // This value is already tested above
		url: {
			lifetimeMs: ms(url.lifetime),
			matchPattern: url.matchPattern,
			cleanupIntervalMs: config.url.cleanupIntervalMs, // We're not yet testing this
		},
		storage: {
			driverName: storage.driverName as StorageDriverName,
			driverConfig:
				storage.driverName === StorageDriverName.Relational
					? storage.relationalDriverConfig
					: storage.driverName === StorageDriverName.Redis
					? storage.redisDriverConfig
					: {},
		},
		auth: {
			driverName: auth.driverName,
			driverConfig: auth.bearerTokenDriverConfig,
		},
	})
})

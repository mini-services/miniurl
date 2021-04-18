import ms from 'ms'
import { StorageDriverName } from '../../services/storage/types/config.js'
import { normalizeConfig } from '../normalize.js'
import { getMockRawConfig } from './helpers.js'

test('Happy flow', () => {
	const rawConfig = getMockRawConfig()
	const { port, logLevel, apiPrefix, appName, baseRedirectUrl, url, storage, auth } = rawConfig

	const config = normalizeConfig(rawConfig)

	// Checks that the baseRedirectUrl is unchanged and ends with a '/'
	expect(config.baseRedirectUrl.endsWith('/')).toBe(true)
	expect(baseRedirectUrl === config.baseRedirectUrl || baseRedirectUrl + '/' === config.baseRedirectUrl).toBe(true)

	const urlLifetimeMs = ms(url.lifetime)

	expect(config).toEqual({
		port,
		logLevel,
		apiPrefix,
		appName,
		baseRedirectUrl: config.baseRedirectUrl, // This value is already tested above
		url: {
			lifetimeMs: urlLifetimeMs,
			matchPattern: url.matchPattern,
			cleanupIntervalMs: config.url.cleanupIntervalMs, // We're not yet testing this
		},
		storage: {
			appName,
			urlLifetimeMs,
			cleanupIntervalMs: config.url.cleanupIntervalMs, // We're not yet testing this
			driverName: storage.driverName as StorageDriverName,
			driverConfig: storage.driverName === StorageDriverName.Postgres ? storage.postgresDriverConfig : {},
		},
		auth: {
			driverName: auth.driverName,
			driverConfig: auth.bearerTokenDriverConfig,
		},
	})
})

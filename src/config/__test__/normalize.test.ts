import ms from 'ms'
import { StorageDriverName } from '../../services/storage/types/config.js'
import { normalizeConfig } from '../normalize.js'
import { getRawConfig } from './helpers.js'

test('Happy flow', () => {
	const rawConfig = getRawConfig()
	const { port, logLevel, apiPrefix, appName, baseRedirectUrl, url, storage, auth } = rawConfig

	const config = normalizeConfig(rawConfig)

	// Checks that the baseRedirectUrl is unchanged and ends with a '/'
	expect(config.baseRedirectUrl.endsWith('/')).toBe(true)
	expect(baseRedirectUrl === config.baseRedirectUrl || baseRedirectUrl + '/' === config.baseRedirectUrl).toBe(true)

	expect(config).toEqual({
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
			driverConfig: storage.driverName === StorageDriverName.Relational ? storage.relationalDriverConfig : {},
		},
		auth: {
			driverName: auth.driverName,
			driverConfig: auth.bearerTokenDriverConfig,
		},
	})
})

import type { StorageConfig } from '../services/storage/types/config'
import type { AuthConfig } from '../services/auth/types/config'

export interface RawConfig {
	port: string
	logLevel: string
	apiPrefix: string
	appName: string
	baseRedirectUrl: string
	url: {
		matchPattern: string
		lifetime: string
		urlExpireFrom: string
	}
	storage: {
		driverName: string
		relationalDriverConfig: {
			client: string
			connection: {
				host: string
				user: string
				password: string
				database: string
			}
		}
	}
	auth: {
		driverName: string
		bearerTokenDriverConfig: {
			token: string
		}
	}
}

export interface Config {
	port: string
	logLevel: string
	apiPrefix: string
	appName: string
	url: {
		matchPattern: string
		lifetimeMs: number
		urlExpireFrom: string
		cleanupIntervalMs: number
	}
	baseRedirectUrl: string
	storage: Omit<StorageConfig, 'appName'>
	auth: AuthConfig
}

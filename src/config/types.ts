import { AuthConfig } from '../services/auth/types/config'
import type { StorageConfig } from '../services/storage/types/config'

export interface RawConfig {
	port: string
	logLevel: string
	apiPrefix: string
	appName: string
	baseRedirectUrl: string
	url: {
		matchPattern: string
		lifetime: string
	}
	storage: {
		driverName: string
		postgresDriverConfig: {
			connection: {
				host: string
				user: string
				password: string
				database: string
			}
		}
		sqliteDriverConfig: {
			connection: {
				filename: string
			}
		}
		redisDriverConfig: {
			host: string
			port: string
			username: string
			password: string
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
		cleanupIntervalMs: number
	}
	baseRedirectUrl: string
	storage: StorageConfig
	auth: AuthConfig
}

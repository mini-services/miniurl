import type { StorageConfig } from '../storage/types/config'

export interface RawConfig {
	port: string
	appName: string
	baseRedirectUrl: string
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
}

export interface Config {
	port: string
	appName: string
	baseRedirectUrl: string
	storage: Omit<StorageConfig, 'appName'>
}

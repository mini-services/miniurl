import type { BearerTokenDriverConfig } from '../drivers/bearerToken/types'

export enum AuthDriverName {
	BearerToken = 'BearerToken',
}

export interface BearerTokenConfig {
	driverName: AuthDriverName.BearerToken
	driverConfig: BearerTokenDriverConfig
}

export type AuthConfig = BearerTokenConfig

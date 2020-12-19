import type { BearerTokenDriverConfig } from './drivers/bearerToken/types'
import type { FastifyRequest } from 'fastify'

export type DriverConfig = BearerTokenDriverConfig
export enum Scope {
	All = 'all',
	Basic = 'basic',
}

export interface AuthDriver {
	isAuthorized(request: FastifyRequest, scopes: Scope[]): Promise<boolean>
	allowedScopes(request: FastifyRequest): Promise<Scope[]>
	authorize(request: FastifyRequest, scope: Scope[]): Promise<void> // Throws an error if fails
}

export type Driver = 'BearerToken'

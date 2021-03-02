import type { FastifyRequest } from 'fastify'

export interface AuthDriver {
	isAuthorized(request: FastifyRequest): Promise<boolean>
	authorize(request: FastifyRequest): Promise<void> // Throws an error if fails
}

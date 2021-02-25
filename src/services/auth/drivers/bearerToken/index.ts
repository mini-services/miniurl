import { AuthDriver, Scope } from '../../types'
import { BearerTokenDriverConfig } from './types'
import { FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../../../../errors/unauthorized'
import { logger } from '../../../logger/logger.js'

export class BearerTokenAuth implements AuthDriver {
	private token: string
	private tokenPrefix = 'Bearer '
	constructor(driverConfig: BearerTokenDriverConfig) {
		this.token = driverConfig.token
	}
	private verifyHeaderAndExtractToken(request: FastifyRequest): null | string {
		logger.debug(`Running verifyHeaderAndExtractToken with ${request}`)
		const authHeader = request.raw.headers.authorization || ''
		const hasValidPrefix = authHeader.startsWith(this.tokenPrefix)
		const token = authHeader.substring(this.tokenPrefix.length)

		if (typeof authHeader === 'undefined' || !hasValidPrefix) return null
		return token
	}
	public async isAuthorized(request: FastifyRequest): Promise<boolean> {
		logger.debug(`Running isAuthorized with ${request}`)
		const token = this.verifyHeaderAndExtractToken(request)

		return token !== null && token === this.token
	}
	public async allowedScopes(request: FastifyRequest): Promise<Scope[]> {
		logger.debug(`Running allowedScopes with ${request}`)
		this.isAuthorized(request)
		return (await this.isAuthorized(request)) ? [Scope.All] : [Scope.Basic]
	}
	public async authorize(request: FastifyRequest): Promise<void> {
		logger.debug(`Running authorize with ${request}`)
		if (!(await this.isAuthorized(request))) throw new UnauthorizedError()
	}
}

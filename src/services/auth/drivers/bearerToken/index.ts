import { AuthDriver } from '../../types'
import { BearerTokenDriverConfig } from './types'
import { FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../../../../errors/unauthorized.js'

export class BearerTokenAuth implements AuthDriver {
	private token: string
	private tokenPrefix = 'Bearer '

	constructor(driverConfig: BearerTokenDriverConfig) {
		this.token = driverConfig.token
	}

	private verifyHeaderAndExtractToken(request: FastifyRequest): null | string {
		const authHeader = request.raw.headers.authorization || ''
		const hasValidPrefix = authHeader.startsWith(this.tokenPrefix)
		const token = authHeader.substring(this.tokenPrefix.length)

		if (typeof authHeader === 'undefined' || !hasValidPrefix) return null
		return token
	}
	public async isAuthorized(request: FastifyRequest): Promise<boolean> {
		const token = this.verifyHeaderAndExtractToken(request)

		return token !== null && token === this.token
	}
	public async authorize(request: FastifyRequest): Promise<void> {
		if (!(await this.isAuthorized(request))) throw new UnauthorizedError()
	}
}

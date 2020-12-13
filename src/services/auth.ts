import { FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors/unauthorized'

const secret = 'secret-token'
const tokenPrefix = 'Bearer '
class Auth {
	isValid(token: string) {
		return token === secret
	}
	authenticate(request: FastifyRequest) {
		const authHeader = request.raw.headers.authorization || ''
		const hasValidPrefix = authHeader.startsWith(tokenPrefix)
		const isValidToken = secret === authHeader.substring(tokenPrefix.length)

		if (!(authHeader && hasValidPrefix && isValidToken)) throw new UnauthorizedError()

		return true
	}
}

export const auth = new Auth()

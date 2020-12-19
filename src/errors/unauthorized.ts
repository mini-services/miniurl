import createError from 'fastify-error'

export const UnauthorizedError = createError('ERR_UNAUTHORIZED', 'Unauthorized', 401)

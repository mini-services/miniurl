import createError from 'fastify-error'

export const UnauthorizedError = createError('MINIURL_ERR_UNAUTHORIZED', 'Unauthorized', 401)

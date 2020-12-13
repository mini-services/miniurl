import createError from 'fastify-error'

export const NotFoundError = createError('MINIURL_ERR_NOT_FOUND', 'Not found', 404)

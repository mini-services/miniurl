import createError from 'fastify-error'

export const NotFoundError = createError('ERR_NOT_FOUND', 'Not found', 404)

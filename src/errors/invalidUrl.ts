import createError from 'fastify-error'

export const InvalidUrl = createError('ERR_INVALID_URL', `Invalid Url.`, 400)

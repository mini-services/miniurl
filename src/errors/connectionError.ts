import createError from 'fastify-error'

export const ConnectionError = createError('ERR_CONNECTION_FAILED', `[FATAL] Connection error.`, 500)

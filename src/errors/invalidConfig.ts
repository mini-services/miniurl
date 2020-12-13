import createError from 'fastify-error'

export const InvalidConfigError = createError('MINIURL_ERR_INVALID_CONFIG', `[FATAL] Invalid config.`, 500)

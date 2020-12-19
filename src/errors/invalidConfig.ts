import createError from 'fastify-error'

export const InvalidConfigError = createError('ERR_INVALID_CONFIG', `[FATAL] Invalid config.`, 500)

import createError from 'fastify-error'

export const GeneralError = createError('ERR_GENERAL_ERROR', 'Error', 500)

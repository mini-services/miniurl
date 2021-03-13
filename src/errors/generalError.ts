import createError from 'fastify-error'

export const GeneralError = createError('ERR_GENERAL_ERROR', 'Error', 500)
export const OperationFailed = createError('ERR_OPERATION_FAILED', 'Error', 500)

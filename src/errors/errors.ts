import createError from 'fastify-error'

export const GeneralError = createError('ERR_GENERAL_ERROR', 'Error', 500)
export const OperationFailed = createError('ERR_OPERATION_FAILED', 'Failed to execute operation', 500)
export const InvalidConfigError = createError('ERR_INVALID_CONFIG', `[FATAL] Invalid config.`, 500)
export const InvalidUrl = createError('ERR_INVALID_URL', `Invalid Url.`, 400)
export const InvalidPayloadError = createError('ERR_INVALID_URL_PAYLOAD', `payload includes invalid fields`, 400)
export const NotFoundError = createError('ERR_NOT_FOUND', 'Not found', 404)
export const UnauthorizedError = createError('ERR_UNAUTHORIZED', 'Unauthorized', 401)

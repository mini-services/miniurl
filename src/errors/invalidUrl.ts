import createError from 'fastify-error'

export const InvalidUrl = createError('ERR_INVALID_URL', `Invalid Url.`, 400)
export const InvalidPayloadError = createError('ERR_INVALID_URL_PAYLOAD', `payload include invalid fields`, 400)
export const IncompatibleResponse = createError(
	'INCOMPATIBLE_RESPONSE',
	'unexpected object type received from server',
	undefined,
)

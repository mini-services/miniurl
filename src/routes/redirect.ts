import { FastifyPluginAsync } from 'fastify'
import { NotFoundError } from '../errors/notFound.js'

export const redirectRoutes: FastifyPluginAsync = async function (fastify) {
	const parsedUrl = new URL(fastify.config.baseRedirectUrl)

	const url = `${parsedUrl.pathname}:id`
	/* Retrieve URL from store by id and redirect to it */
	fastify.route<{ Params: { id: string } }>({
		method: 'GET',
		url,
		handler: async function (request, reply) {
			if (request.validationError) throw new NotFoundError()

			const storedUrl = await this.storage.url.get(request.params.id)

			if (typeof storedUrl.url === 'undefined') throw new NotFoundError()

			await this.storage.url.incVisitCount(request.params.id)

			reply.redirect(storedUrl.url)
		},
		attachValidation: true,
		schema: {
			params: {
				type: 'object',
				required: ['id'],
				properties: {
					id: { type: 'string' },
				},
			},
		},
	})
}

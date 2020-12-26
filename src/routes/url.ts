import { FastifyPluginAsync } from 'fastify'
import { Route } from '../types/routes.js'
import { NotFoundError } from '../errors/notFound.js'
import { validateUrl } from '../services/urlValidator.js'

/* Save URL to store and return the new shortened url */
const saveUrl: Route<{ Body: { url: string } }> = {
	method: 'POST',
	url: '/url',
	schema: {
		body: {
			type: 'object',
			required: ['url'],
			properties: {
				url: { type: 'string' },
			},
		},
	},
	async handler(request) {
		await validateUrl(request.body.url)
		const url = await this.storage.url.save(request.body.url)

		return `${this.config.baseRedirectUrl}${url.id}`
	},
}

/* Retrieve URL from store by id */
const retrieveUrl: Route<{ Params: { id: string }; Querystring: { redirect?: string } }> = {
	method: 'GET',
	url: '/url/:id',
	schema: {
		params: {
			type: 'object',
			required: ['id'],
			properties: {
				id: {
					type: 'string',
				},
			},
		},
	},
	attachValidation: true,
	async handler(request, reply) {
		if (request.validationError) throw new NotFoundError()

		const url = await this.storage.url.get(request.params.id)
		if (typeof url === 'undefined') throw new NotFoundError()

		const falseStrings = ['false', '0']
		const redirect = request.query.redirect
		if (typeof redirect !== 'undefined' && !falseStrings.includes(redirect)) return reply.redirect(url.url)

		return url
	},
}

export const urlRoutes: FastifyPluginAsync = async function (fastify) {
	fastify.route(saveUrl)
	fastify.route(retrieveUrl)
}

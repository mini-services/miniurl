import { FastifyPluginAsync } from 'fastify'
import { Route } from '../types/routes.js'
import { store } from '../services/store.js'
import { NotFoundError } from '../errors/notFound.js'

/* Save URL to store and return the id */
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
		const id = store.saveUrl(request.body.url)
		const baseUrl = this.config.baseRedirectUrl

		if (!id) return ''
		return `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${id}`
	},
}

/* Retrieve URL from store by id */
const retrieveUrl: Route<{ Params: { id: string } }> = {
	method: 'GET',
	url: '/url/:id',
	schema: {
		params: {
			type: 'object',
			required: ['id'],
			properties: {
				id: {
					type: 'string',
					minLength: 6,
					maxLength: 6,
				},
			},
		},
	},
	attachValidation: true,
	async handler(request, reply) {
		if (request.validationError) throw new NotFoundError()

		const url = store.getUrl(request.params.id)
		if (typeof url === 'undefined') throw new NotFoundError()

		return url
	},
}

export const urlRoutes: FastifyPluginAsync = async function (fastify) {
	fastify.route(saveUrl)
	fastify.route(retrieveUrl)
}

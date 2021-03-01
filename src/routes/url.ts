import { FastifyPluginAsync } from 'fastify'
import { Route } from '../types/routes.js'
import { NotFoundError } from '../errors/notFound.js'
import { validateUrl } from '../services/urlValidator.js'
import { UrlRequestData } from '../services/storage/types/url'

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
		const urlRequestData = { url: request.body.url, ip: request.ip } as UrlRequestData
		const url = await this.storage.url.save(urlRequestData)

		return `${this.config.baseRedirectUrl}${url.id}`
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
				},
			},
		},
	},
	attachValidation: true,
	async handler(request, reply) {
		if (request.validationError) throw new NotFoundError()
		const withInfo = await this.auth.isAuthorized(request)
		const storedUrl = await this.storage.url.get(request.params.id, { withInfo })
		if (typeof storedUrl === 'undefined') throw new NotFoundError()

		this.storage.url.incInfoCount(request.params.id)

		return storedUrl
	},
}

export const urlRoutes: FastifyPluginAsync = async function (fastify) {
	fastify.route(saveUrl)
	fastify.route(retrieveUrl)
}

import { FastifyPluginAsync } from 'fastify'
import { Route } from '../types/routes.js'
import { GeneralError, NotFoundError, UnauthorizedError } from '../errors/errors.js'
import { validateUrl } from '../services/urlValidator.js'
import { UrlRequestData } from '../services/storage/types/url'

/* Save URL to store and return the new shortened url */
const saveUrl: Route<{ Body: { url: string; id?: string } }> = {
	method: 'POST',
	url: '/url',
	schema: {
		body: {
			type: 'object',
			required: ['url'],
			properties: {
				url: { type: 'string' },
				id: { type: 'string' },
			},
		},
	},
	async handler(request) {
		await validateUrl(request.body.url, this.config.url.matchPattern)

		let urlRequestData = {
			url: request.body.url,
			ip: request.ip,
			requestUrl: request.hostname + request.url,
		} as UrlRequestData
		// Custom ids require admin rights
		if (request.body.id) {
			await this.auth.authorize(request)
			urlRequestData = { ...urlRequestData, id: request.body.id } as UrlRequestData
		}

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
	async handler(request) {
		if (request.validationError) throw new NotFoundError()

		const withInfo = await this.auth.isAuthorized(request)
		const storedUrl = await this.storage.url.get(request.params.id, { withInfo })
		if (typeof storedUrl === 'undefined') throw new NotFoundError()

		try {
			await this.storage.url.incInfoCount(request.params.id)
		} catch (e) {
			this.log.warn('incInfoCount failed in retrieveUrl endpoint')
		}

		return storedUrl
	},
}

/* Update URL origin path */
const updateUrl: Route<{ Params: { id: string }; Body: { url: string } }> = {
	method: 'PUT',
	url: '/url/:id',
	schema: {
		body: {
			type: 'object',
			required: ['url'],
			properties: {
				url: { type: 'string' },
			},
		},
	},
	attachValidation: true,
	async handler(request) {
		await validateUrl(request.body.url, this.config.url.matchPattern)
		await this.auth.authorize(request)
		const storedUrl = await this.storage.url.edit(request.params.id, request.body.url)
		if (typeof storedUrl === 'undefined') throw new NotFoundError()

		return storedUrl
	},
}

/* Delete URL from store  */
const deleteUrl: Route<{ Params: { id: string } }> = {
	method: 'DELETE',
	url: '/url/:id',
	schema: {
		params: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'string' },
			},
		},
	},
	async handler(request) {
		await this.auth.authorize(request)
		try {
			await this.storage.url.delete(request.params.id)
		} catch (e) {
			this.log.warn('delete url failed in deleteUrl endpoint')
			this.log.error(e.message)
			throw GeneralError(e.message)
		}
		return Promise.resolve(true)
	},
}

export const urlRoutes: FastifyPluginAsync = async function (fastify) {
	fastify.route(saveUrl)
	fastify.route(retrieveUrl)
	fastify.route(updateUrl)
	fastify.route(deleteUrl)
}

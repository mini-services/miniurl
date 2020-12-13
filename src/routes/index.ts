import { redirectRoutes } from './redirect.js'
import { urlRoutes } from './url.js'
import { adminRoutes } from './admin.js'
import { FastifyPluginAsync } from 'fastify'

export const routes: FastifyPluginAsync = async function (fastify) {
	await fastify.register(redirectRoutes)
	await fastify.register(
		async function (fastifyInstance) {
			await fastifyInstance.register(urlRoutes)
			await fastifyInstance.register(adminRoutes)
		},
		{ prefix: '_' },
	)
}

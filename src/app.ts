import fastifyConstructor, { FastifyInstance } from 'fastify'
import { routes } from './routes/index.js'
import { Storage } from './services/storage/index.js'
import { Auth } from './services/auth/index.js'
import { Config } from './config/types.js'

declare module 'fastify' {
	interface FastifyInstance {
		config: Config
		storage: Storage
		auth: Auth
	}
}

export async function createApp(
	fastifyOptions = {},
	{ config, auth, storage }: { config: Config; auth: Auth; storage: Storage },
): Promise<FastifyInstance> {
	// Fastify
	const fastify = fastifyConstructor(fastifyOptions)

	// Config
	fastify.decorate('config', config)
	fastify.decorate('auth', auth)
	fastify.decorate('storage', storage)

	// Register routes
	await fastify.register(routes)

	return fastify
}

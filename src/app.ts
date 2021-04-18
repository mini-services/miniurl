import fastifyConstructor, { FastifyInstance } from 'fastify'
import { routes } from './routes/index.js'
import { Storage } from './services/storage/index.js'
import { Auth } from './services/auth/index.js'
import { Config } from './config/types.js'
import { logger } from './services/logger/logger.js'

declare module 'fastify' {
	interface FastifyInstance {
		config: Config
		storage: Storage
		auth: Auth
	}
}

export async function createApp(config: Config): Promise<FastifyInstance> {
	// Logger
	logger.info(`Logger level defined as ${config.logLevel}`)
	logger.setLevel(config.logLevel)

	// Fastify
	const fastify = fastifyConstructor({
		ignoreTrailingSlash: true,
		logger,
	})
	fastify.decorate('config', config)

	// Storage
	const storage = new Storage(config.storage)
	await storage.initialize()
	fastify.decorate('storage', storage)

	// Auth
	const auth = new Auth(config.auth)
	fastify.decorate('auth', auth)

	// Register routes
	await fastify.register(routes)

	return fastify
}

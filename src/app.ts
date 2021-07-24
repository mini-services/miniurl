import Fastify, { FastifyInstance } from 'fastify'
import { routes } from './routes/index.js'
import { Storage } from './services/storage/index.js'
import { Auth } from './services/auth/index.js'
import { Config } from './config/types.js'
import { logger } from './services/logger/logger.js'
import { runWithGracefulShutdown } from './helpers/runWithGracefulShutdown.js'

declare module 'fastify' {
	interface FastifyInstance {
		config: Config
		storage: Storage
		auth: Auth
		runWithGracefulShutdown: () => Promise<void>
		shutdown: () => Promise<void>
	}
}

export async function createApp(config: Config): Promise<FastifyInstance> {
	// Logger
	logger.info(`Logger level defined as ${config.logLevel}`)
	logger.setLevel(config.logLevel)

	// Fastify
	const app = Fastify({
		ignoreTrailingSlash: true,
		logger,
	})
	app.decorate('config', config)

	// Storage
	const storage = new Storage(config.storage)
	await storage.initialize()
	app.decorate('storage', storage)

	// Auth
	const auth = new Auth(config.auth)
	app.decorate('auth', auth)

	app.decorate('shutdown', async () => {
		app.log.info('Shutting down...')
		await Promise.all([app.storage.shutdown(), app.close()])
	})

	app.decorate('runWithGracefulShutdown', () => runWithGracefulShutdown(app, config.port, () => app.shutdown()))

	// Register routes
	await app.register(routes)

	return app
}

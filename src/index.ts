import fastifyConstructor from 'fastify'
import {config} from './config/index.js'
import {routes} from './routes/index.js'
import {Storage} from './services/storage/index.js'
import {logger} from './services/logger/logger.js'
import {Auth} from './services/auth/index.js'
import {runWithGracefulShutdown} from './helpers/runWithGracefulShutdown.js'
import {StorageDriverName} from "./services/storage/types/config";

declare module 'fastify' {
	interface FastifyInstance {
		config: typeof config
		storage: Storage
		auth: Auth
	}
}

// Logger
logger.info(`Logger level defined as ${config.logLevel}`)
logger.setLevel(config.logLevel)

// Fastify
const fastify = fastifyConstructor({
	ignoreTrailingSlash: true,
	logger,
})

// Config
fastify.decorate('config', config)

// Auth
const auth = new Auth(config.auth)
fastify.decorate('auth', auth)

// Storage
const storage = new Storage({
	appName: config.appName,
	driverName: config.storage.driverName,
	driverConfig: config.storage.driverConfig,
})
await storage.initialize()
fastify.decorate('storage', storage)

// URL cleanup
await storage.url.deleteOverdue(config.url.lifetimeMs)
const intervalToken = setInterval(() => storage.url.deleteOverdue(config.url.lifetimeMs), config.url.cleanupIntervalMs)

// Register routes and start server
await fastify.register(routes)
runWithGracefulShutdown(fastify, config.port, () => {
	clearInterval(intervalToken)
})

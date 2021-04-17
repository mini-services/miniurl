import { Storage } from './services/storage/index.js'
import { Auth } from './services/auth/index.js'
import { config } from './config/index.js'
import { logger } from './services/logger/logger.js'
import { runWithGracefulShutdown } from './helpers/runWithGracefulShutdown.js'
import { createApp } from './app.js'

// Logger
logger.info(`Logger level defined as ${config.logLevel}`)
logger.setLevel(config.logLevel)

// Storage
const storage = new Storage(config.storage)
await storage.initialize()

// Fastify
const fastify = await createApp(
	{
		ignoreTrailingSlash: true,
		logger,
	},
	{
		config,
		auth: new Auth(config.auth),
		storage,
	},
)

// Start server
runWithGracefulShutdown(fastify, config.port, async () => {
	await storage.shutdown()
})

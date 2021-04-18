import { getConfig } from './config/index.js'
import { runWithGracefulShutdown } from './helpers/runWithGracefulShutdown.js'
import { createApp } from './app.js'

const config = getConfig()

const fastify = await createApp(config)

// Start server
runWithGracefulShutdown(fastify, config.port, async () => {
	await fastify.storage.shutdown()
})

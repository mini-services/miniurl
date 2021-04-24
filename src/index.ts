import { getConfig } from './config/index.js'
import { runWithGracefulShutdown } from './helpers/runWithGracefulShutdown.js'
import { createApp } from './app.js'

const config = getConfig()

const app = await createApp(config)

// Start server
runWithGracefulShutdown(app, config.port, async () => {
	await app.storage.shutdown()
})

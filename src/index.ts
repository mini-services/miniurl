import { getConfig } from './config/index.js'
import { createApp } from './app.js'

const config = getConfig()
const app = await createApp(config)

await app.runWithGracefulShutdown()

import { getConfig } from '../../src/config/index.js'
import { createApp } from '../../src/app.js'
import { FastifyInstance } from 'fastify'

export async function runApp(envVariables: Record<string, string> = {}): Promise<FastifyInstance> {
	const envDefaults = {
		BASE_REDIRECT_URL: 'http://localhost:8000/u/',
		STORAGE_DRIVER: 'Sqlite',
		LOG_LEVEL: 'warn',
		PORT: '4004',
	}

	const env = Object.assign(envDefaults, envVariables)
	Object.entries(env).forEach(([key, value]) => (process.env[key] = value))

	const config = getConfig()
	const app = await createApp(config)

	return app
}

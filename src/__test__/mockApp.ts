import fastifyConstructor, { FastifyInstance } from 'fastify'
import { mockGetConfig } from '../config/__test__/mock.js'
import { MockStorage } from '../services/storage/__test__/mock.js'
import { MockAuth } from '../services/auth/__test__/mock.js'

export async function mockCreateApp(): Promise<FastifyInstance> {
	// Fastify
	const app = fastifyConstructor({
		ignoreTrailingSlash: true,
	})
	app.decorate('config', mockGetConfig())
	app.decorate('storage', new MockStorage())
	app.decorate('auth', new MockAuth())

	return app
}

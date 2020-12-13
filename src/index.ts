import fastifyConstructor from 'fastify'
import { config } from './services/config.js'
import { routes } from './routes/index.js'

// TODO: move elsewhere
declare module 'fastify' {
	interface FastifyInstance {
		config: Record<string, string>
	}
}

const fastify = fastifyConstructor({
	ignoreTrailingSlash: true,
	logger: true,
})

fastify.decorate('config', config)
await fastify.register(routes)

try {
	await fastify.listen(config.port, '0.0.0.0')
} catch (err) {
	fastify.log.error(err)
	process.exit(1)
}

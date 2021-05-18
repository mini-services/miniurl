import { FastifyInstance } from 'fastify'

const shutdownSignals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']

export async function runWithGracefulShutdown(
	fastify: FastifyInstance,
	port: string,
	cleanupCallback?: () => Promise<void> | void,
): Promise<void> {
	// Graceful shutdown
	shutdownSignals.forEach((signal: NodeJS.Signals) =>
		process.on(signal, async () => {
			if (cleanupCallback) await cleanupCallback()
			await fastify.close()
		}),
	)

	// Run
	try {
		await fastify.listen(port, '0.0.0.0')
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

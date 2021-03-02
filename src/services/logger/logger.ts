import Pino from 'pino'
const logger = Pino({
	prettyPrint: true,
	level: 'debug',
})

logger.setLevel = function setLevel(newLevel: string) {
	logger.level = newLevel
}

export { logger }

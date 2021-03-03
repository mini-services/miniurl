import Pino from 'pino'
const logger = Pino({
	prettyPrint: true,
})

logger.setLevel = function setLevel(newLevel: string) {
	logger.level = newLevel
}

export { logger }

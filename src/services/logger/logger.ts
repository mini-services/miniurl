import Pino from 'pino'
const logger = Pino()

logger.setLevel = function setLevel(newLevel: string) {
	logger.level = newLevel
}

export { logger }

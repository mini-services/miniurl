import Pino from 'pino'
const logger = Pino({
	prettyPrint: true,
})

logger.setLevel = function setLevel(newLevel: string) {
	logger.level = newLevel
}

logger.on('level-change', () => {
	console.log(`Logger: Level changed to ${logger.level}`)
})

logger.debug(`Hi, Logger started`)

export { logger }

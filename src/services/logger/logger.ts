/* eslint-disable */
import Pino from 'pino'
const logger = Pino()

logger.info(`Hi! Here is my first massage`)

logger.setLevel = function setLevel (newLevel: any) {
    logger.level = newLevel;
}
logger.on('level-change', () => {
  logger.info(`the Level defined as ${logger.level}`)
})

export { logger };

/*
({
  prettyPrint: true,
})
*/
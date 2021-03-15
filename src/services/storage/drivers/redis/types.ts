import { config } from '../../../../config/index.js'
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RedisStorageDriverConfig {}
const urlLifeTime = config.url.lifetimeMs
const redisConf = config.redisDriverConfig
export { urlLifeTime, redisConf }


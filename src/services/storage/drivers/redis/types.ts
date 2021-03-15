import IORedis from 'ioredis'
import { config } from '../../../../config/index.js'

export type RedisStorageDriverConfig = IORedis.RedisOptions
const urlLifeTime = config.url.lifetimeMs

export { urlLifeTime }

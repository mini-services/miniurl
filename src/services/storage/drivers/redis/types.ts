import { config } from '../../../../config/index.js'
import IORedis from 'ioredis'
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RedisStorageDriverConfig {}
const urlLifeTime = config.url.lifetimeMs
export { urlLifeTime }

import { StorageDriver } from '../../types/index.js'
import { StoredUrl, UrlRequestData, UrlWithInformation } from '../../types/url.js'
import { RedisHelper } from '../../../../helpers/redisHelper.js'
import { RedisStorageConfig } from '../../types/config.js'
import IORedis from 'ioredis'
import { config } from '../../../../config/index.js'
import cryptoRandomString from 'crypto-random-string'
import { OperationFailed } from '../../../../errors/generalError.js'

export class RedisStorage implements StorageDriver {
	public redisHelper: RedisHelper
	private _client: IORedis.Redis = new IORedis()

	get client(): IORedis.Redis {
		return this._client
	}

	constructor(_config: RedisStorageConfig) {
		this.redisHelper = new RedisHelper(this)
	}

	initialize(): Promise<void> {
		//connection with the db checked in storage/index runWithRetries
		return new Promise<void>((resolve) => resolve())
	}

	url = new (class RedisUrlStorage {
		constructor(public storage: RedisStorage) {}

		get(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlWithInformation> {
			return this.storage.redisHelper.fetchUrlInfoFromDB(id, options.withInfo)
		}

		public async delete(id: string): Promise<void | number> {
			return await this.storage.client.del(id)
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		deleteOverdue(timespanMs: number): Promise<number> {
			//not in use since Redis has build-in mechanism to delete keys after period of time
			return Promise.resolve(-1)
		}
		async edit(id: string, url: string): Promise<StoredUrl> {
			const dbUrl: StoredUrl = await this.storage.redisHelper.fetchUrlInfoFromDB(id, false)
			dbUrl.updatedAt = new Date().toISOString()
			dbUrl.url = url

			if (
				(await this.storage.client.setex(dbUrl.id, config.url.lifetimeMs / 1000, JSON.stringify(dbUrl))) ===
				'OK'
			) {
				return dbUrl
			} else throw new OperationFailed()
		}
		async incInfoCount(id: string): Promise<void> {
			if (!id) throw new OperationFailed('Must provide an id')

			const urlFromDb: UrlWithInformation = <UrlWithInformation>(
				await this.storage.redisHelper.fetchUrlInfoFromDB(id, true)
			)

			urlFromDb.updatedAt = new Date().toISOString()
			urlFromDb.infoVisitCount = ++urlFromDb.infoVisitCount

			const ttl = await this.storage.client.ttl(id)
			if ((await this.storage.client.setex(id, ttl, JSON.stringify(urlFromDb))) !== 'OK') {
				throw new OperationFailed()
			}
		}

		async incVisitCount(id: string): Promise<void> {
			if (!id) throw new OperationFailed('Must provide an id')

			const urlFromDb: UrlWithInformation = <UrlWithInformation>(
				await this.storage.redisHelper.fetchUrlInfoFromDB(id, true)
			)
			urlFromDb.updatedAt = new Date().toISOString()
			urlFromDb.urlVisitCount = ++urlFromDb.urlVisitCount

			const ttl = await this.storage.client.ttl(id)
			if ((await this.storage.client.setex(id, ttl, JSON.stringify(urlFromDb))) !== 'OK') {
				throw new OperationFailed()
			}
		}

		async save({ ip, url }: UrlRequestData): Promise<StoredUrl> {
			if (!url || !ip) throw new OperationFailed('Must provide an ip & url')

			const storedUrlWithInfo: UrlWithInformation = {
				id: cryptoRandomString({ length: 6, type: 'url-safe' }),
				url: url,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				ip: ip,
				urlVisitCount: 0,
				infoVisitCount: 0,
				lastUsed: new Date().toISOString(),
			}
			if (
				(await this.storage.client.setex(
					storedUrlWithInfo.id,
					config.url.lifetimeMs / 1000,
					JSON.stringify(storedUrlWithInfo),
				)) === 'OK'
			) {
				return storedUrlWithInfo
			} else throw new OperationFailed()
		}
	})(this)
}

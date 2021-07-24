import IORedis from 'ioredis'
import { StorageDriver } from '../../types'
import { RedisStorageConfig } from '../../types/config'
import { StoredUrl, UrlRequestData, UrlWithInformation } from '../../types/url'
import cryptoRandomString from 'crypto-random-string'
import { NotFoundError, OperationFailed } from '../../../../errors/errors.js'

export class RedisStorage implements StorageDriver {
	private _client: IORedis.Redis

	constructor(private _config: RedisStorageConfig) {
		this._client = new IORedis({ ...this._config.driverConfig, lazyConnect: true })
	}

	get client(): IORedis.Redis {
		return this._client
	}

	async shutdown(): Promise<void> {
		await this.client.disconnect()
	}

	async initialize(): Promise<void> {
		await this._client.connect()
	}

	url = new (class RedisUrlStorage {
		constructor(public storage: RedisStorage) {}

		async get(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlWithInformation> {
			const rawUrlData = await this.storage.client.get(id)
			if (!rawUrlData) throw new NotFoundError()

			const urlData = JSON.parse(rawUrlData) as UrlWithInformation
			if (options.withInfo) return urlData
			else {
				return {
					id: urlData.id,
					url: urlData.url,
					createdAt: urlData.createdAt,
					updatedAt: urlData.updatedAt,
				}
			}
		}

		public async delete(id: string): Promise<void | number> {
			return this.storage.client.del(id)
		}

		async deleteOverdue(): Promise<number> {
			// Not in use since Redis has a built-in mechanism to delete records after a period of time
			return -1
		}

		async edit(id: string, url: string): Promise<StoredUrl> {
			const dbUrl: StoredUrl = await this.get(id, { withInfo: false })
			dbUrl.updatedAt = new Date().toISOString()
			dbUrl.url = url
			await this.storage.client.setex(dbUrl.id, this.storage._config.urlLifetimeMs / 1000, JSON.stringify(dbUrl))
			return dbUrl
		}

		async incInfoCount(id: string): Promise<void> {
			if (!id) throw new OperationFailed('Must provide an id')

			const urlFromDb: UrlWithInformation = <UrlWithInformation>await this.get(id, { withInfo: true })

			urlFromDb.updatedAt = new Date().toISOString()
			urlFromDb.infoVisitCount = ++urlFromDb.infoVisitCount

			const ttl = await this.storage.client.ttl(id)
			await this.storage.client.setex(id, ttl, JSON.stringify(urlFromDb))
		}

		async incVisitCount(id: string): Promise<void> {
			if (!id) throw new OperationFailed('Must provide an id')

			const urlFromDb: UrlWithInformation = <UrlWithInformation>await this.get(id, { withInfo: true })
			urlFromDb.updatedAt = new Date().toISOString()
			urlFromDb.urlVisitCount = ++urlFromDb.urlVisitCount

			const ttl = await this.storage.client.ttl(id)
			await this.storage.client.setex(id, ttl, JSON.stringify(urlFromDb))
		}

		async save({ ip, url, requestUrl }: UrlRequestData): Promise<StoredUrl> {
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
				requestUrl: requestUrl,
			}
			await this.storage.client.setex(
				storedUrlWithInfo.id,
				this.storage._config.urlLifetimeMs / 1000,
				JSON.stringify(storedUrlWithInfo),
			)
			return storedUrlWithInfo
		}
	})(this)
}

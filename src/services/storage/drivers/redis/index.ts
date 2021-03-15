import { StorageDriver } from '../../types/index.js'
import { StoredUrl, UrlRequestData, UrlWithInformation } from '../../types/url.js'
import { RedisStorageConfig } from '../../types/config.js'
import IORedis from 'ioredis'
import cryptoRandomString from 'crypto-random-string'
import { OperationFailed } from '../../../../errors/errors.js'
import { NotFoundError } from '../../../../errors/errors.js'
import {urlLifeTime} from "./types.js";

export class RedisStorage implements StorageDriver {
	private readonly _client: IORedis.Redis
	get client(): IORedis.Redis {
		return this._client
	}

	constructor(_config: RedisStorageConfig) {
		this._client = new IORedis(_config.driverConfig)
	}

	initialize(): Promise<void> {
		//connection with the db checked in storage/index runWithRetries
		return new Promise<void>((resolve) => resolve())
	}

	url = new (class RedisUrlStorage {
		constructor(public storage: RedisStorage) {}
		tempPropertyMap = new Map()
		async get(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlWithInformation> {
			return await this.fetchUrlInfoFromDB(id, options.withInfo)
		}

		public async delete(id: string): Promise<void | number> {
			return this.storage.client.del(id, (err) => {
				throw err
			})
		}

		deleteOverdue(timespanMs: number): Promise<number> {
			//not in use since Redis has build-in mechanism to delete keys after period of time
			return Promise.resolve(-1)
		}
		async edit(id: string, url: string): Promise<StoredUrl> {
			const dbUrl: StoredUrl = await this.fetchUrlInfoFromDB(id, false)
			dbUrl.updatedAt = new Date().toISOString()
			dbUrl.url = url
			//TODO: set ttl according to config flag
			await this.storage.client.setex(dbUrl.id, urlLifeTime / 1000, JSON.stringify(dbUrl), (err) => {
				throw err
			})
			return dbUrl
		}
		async incInfoCount(id: string): Promise<void> {
			if (!id) throw new OperationFailed('Must provide an id')

			const urlFromDb: UrlWithInformation = <UrlWithInformation>(
				await this.fetchUrlInfoFromDB(id, true)
			)

			urlFromDb.updatedAt = new Date().toISOString()
			urlFromDb.infoVisitCount = ++urlFromDb.infoVisitCount

			const ttl = await this.storage.client.ttl(id)
			await this.storage.client.setex(id, ttl, JSON.stringify(urlFromDb), (err) => {
				throw err
			})
		}

		async incVisitCount(id: string): Promise<void> {
			if (!id) throw new OperationFailed('Must provide an id')

			const urlFromDb: UrlWithInformation = <UrlWithInformation>(
				await this.fetchUrlInfoFromDB(id, true)
			)
			urlFromDb.updatedAt = new Date().toISOString()
			urlFromDb.urlVisitCount = ++urlFromDb.urlVisitCount

			const ttl = await this.storage.client.ttl(id)
			await this.storage.client.setex(id, ttl, JSON.stringify(urlFromDb), (err) => {
				throw err
			})
		}

		async save({ ip, url }: UrlRequestData): Promise<StoredUrl> {
			if (!url || !ip) throw new OperationFailed('Must provide an ip & url')

			const storedUrlWithInfo: UrlWithInformation = {
				id: 'miniurl:' + cryptoRandomString({ length: 6, type: 'url-safe' }),
				url: 'url:' + url,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				ip: ip,
				urlVisitCount: 0,
				infoVisitCount: 0,
				lastUsed: new Date().toISOString(),
			}
			await this.storage.client.setex(
				storedUrlWithInfo.id,
				urlLifeTime / 1000, //TODO: set ttl according to config flag
				JSON.stringify(storedUrlWithInfo),
				(err) => {
					throw err
				},
			)

			return storedUrlWithInfo
		}

		async fetchUrlInfoFromDB(id: string, withInfo: boolean): Promise<UrlWithInformation | StoredUrl> {
			this.tempPropertyMap.clear()
			const rawUrlData = (await this.storage.client.get(id)) as string
			if (!rawUrlData) throw new NotFoundError()
			this.processUrlFromStorage(rawUrlData)
			if (withInfo)
				return {
					id: this.tempPropertyMap.get('id'),
					url: this.tempPropertyMap.get('url'),
					createdAt: this.tempPropertyMap.get('createdAt'),
					updatedAt: this.tempPropertyMap.get('updatedAt'),
					ip: this.tempPropertyMap.get('ip'),
					urlVisitCount: this.tempPropertyMap.get('urlVisitCount'),
					infoVisitCount: this.tempPropertyMap.get('infoVisitCount'),
					lastUsed: this.tempPropertyMap.get('lastUsed'),
				}
			else
				return {
					id: this.tempPropertyMap.get('id'),
					url: this.tempPropertyMap.get('url'),
					createdAt: this.tempPropertyMap.get('createdAt'),
					updatedAt: this.tempPropertyMap.get('updatedAt'),
				}
		}
		fillTempPropertyMap(key: string, value: string): void {
			this.tempPropertyMap.set(key, value)
		}

		processUrlFromStorage(rawUrlData: string): void {
			JSON.parse(rawUrlData, (key, value) => {
				if (!this.tempPropertyMap.has(key)) this.fillTempPropertyMap(key, value)
			})
		}
	})(this)
}

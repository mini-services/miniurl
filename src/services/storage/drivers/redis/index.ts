import { StorageDriver } from '../../types'
import { StoredUrl, UrlStorageDriver, UrlWithInformation } from '../../types/url.js'
import { Tedis } from 'tedis'
import { RedisHelper } from '../../../../helpers/redisHelper.js'
import cryptoRandomString from 'crypto-random-string'
import { IncompatibleResponse, InvalidUrl } from '../../../../errors/invalidUrl.js'
import {RedisStorageConfig} from "../../types/config.js";
import {config} from "../../../../config/index.js";
import {isBoolean} from "util";

export class RedisStorage implements StorageDriver {
	private readonly redisClient: Tedis
	private redisHelper: RedisHelper

	constructor(public _config: RedisStorageConfig) {
		this.redisClient = new Tedis()
		this.redisHelper = new RedisHelper(this)
	}

	initialize(): Promise<void> {
		//connection with the db checked in storage/index runWithRetries
		return new Promise<void>((resolve) => resolve())
	}

	public getRedisClient(): Tedis {
		return this.redisClient
	}

	url: UrlStorageDriver = new (class RedisUrlOperations {
		constructor(public redisStorage: RedisStorage) {}

		async delete(id: string): Promise<number> {
			return this.redisStorage.redisClient.del(id)
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async deleteOverdue(timespanMs: number): Promise<number> {
			// not in use since Redis has build-in mechanism to delete keys after period of time
			return -1
		}
		async edit(id: string, url: string): Promise<StoredUrl> {
			const storedUrl = await this.redisStorage.redisHelper.fetchUrlInfoFromDB(id, { withInfo: false })
			storedUrl.updatedAt = new Date().toISOString()
			storedUrl.url = url
			await this.redisStorage.redisClient.set(storedUrl.id, JSON.stringify(storedUrl))
			return storedUrl
		}

		async get(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlWithInformation>{
			return this.redisStorage.redisHelper.fetchUrlInfoFromDB(id, options )
		}

		async save(url: UrlWithInformation): Promise<StoredUrl> {
			if (url.id === 'undefined' || url.url === 'undefined') throw new InvalidUrl()
			const storedUrlWithInfo = {
				id: cryptoRandomString({ length: 6, type: 'url-safe' }),
				url: url.url,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				ip: url.ip != '' ? url.ip : 'undefined',
				urlVisitCount: 0,
				infoVisitCount: 0,
				lastUsed: new Date().toISOString(),
			} as UrlWithInformation
			await this.redisStorage.redisClient.setex(
				storedUrlWithInfo.id,
				config.url.lifetimeMs/ 1000,
				JSON.stringify(storedUrlWithInfo),
			)
			return storedUrlWithInfo
		}
		async incVisitCount(id: string): Promise<void> {
			const url = await this.get(id, { withInfo: true })
			if ('urlVisitCount' in url) {
				url.urlVisitCount++
				url.lastUsed = new Date().toISOString()
			} else
				throw new IncompatibleResponse()
			const ttl = await this.redisStorage.redisClient.ttl(id)
			await this.redisStorage.redisClient.setex(id, ttl, JSON.stringify(url))
		}
		async incInfoCount(id: string): Promise<void> {
			const url = await this.get(id, { withInfo: true })
			if ('infoVisitCount' in url) {
				url.infoVisitCount++
				url.lastUsed = new Date().toISOString()
			} else throw new IncompatibleResponse()
			const ttl = await this.redisStorage.redisClient.ttl(id)
			await this.redisStorage.redisClient.setex(id, ttl, JSON.stringify(url))
		}
	})(this)
}

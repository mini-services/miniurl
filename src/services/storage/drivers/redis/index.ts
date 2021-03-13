import { StorageDriver } from '../../types/index.js'
import { StoredUrl, UrlRequestData, UrlWithInformation } from '../../types/url.js'
import { RedisHelper } from '../../../../helpers/redisHelper.js'
import Redis from 'ioredis'
import { RedisStorageConfig } from '../../types/config.js'
import { url } from '../redis/url.js'
import IORedis from 'ioredis'

export class RedisStorage implements StorageDriver {
	public redisHelper: RedisHelper
	private _client: Redis.Redis = new Redis()

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

	url: url = new url(this)

	deleteOverdue(timespanMs: number): Promise<number> {
		return this.url.deleteOverdue(timespanMs)
	}

	delete(id: string): Promise<void | number> {
		return this.url.delete(id)
	}

	edit(id: string, url: string): Promise<StoredUrl> {
		return this.url.edit(id, url)
	}

	get(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlWithInformation> {
		return this.url.get(id, options)
	}

	save(url: UrlRequestData): Promise<StoredUrl> {
		return this.url.save(url)
	}

	incVisitCount(id: string): Promise<void> {
		return this.url.incVisitCount(id)
	}
	incInfoCount(id: string): Promise<void> {
		return this.url.incInfoCount(id)
	}
}

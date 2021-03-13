import { StoredUrl, UrlWithInformation } from '../services/storage/types/url.js'
import { RedisStorage } from '../services/storage/drivers/redis'
import { NotFoundError } from '../errors/notFound.js'
import { Redis } from 'ioredis'

export class RedisHelper {
	private redis: Redis
	constructor(storage: RedisStorage) {
		this.redis = storage.client
	}
	urlPropertyMap = new Map()
	async fetchUrlInfoFromDB(id: string, withInfo: boolean): Promise<UrlWithInformation | StoredUrl> {
		const rawUrlData = (await this.redis.get(id)) as string
		if (!rawUrlData) throw new NotFoundError()
		this.processUrlFromStorage(rawUrlData)
		if (withInfo)
			return {
				id: this.urlPropertyMap.get('id') || '',
				urlId: this.urlPropertyMap.get('urlId') || '',
				url: this.urlPropertyMap.get('url') || '',
				createdAt: this.urlPropertyMap.get('createdAt') || '',
				updatedAt: this.urlPropertyMap.get('updatedAt') || '',
				ip: this.urlPropertyMap.get('ip') || '',
				urlVisitCount: this.urlPropertyMap.get('urlVisitCount') || 0,
				infoVisitCount: this.urlPropertyMap.get('infoVisitCount') || 0,
				lastUsed: this.urlPropertyMap.get('lastUsed') || '',
			}
		else
			return {
				id: this.urlPropertyMap.get('id') || '',
				url: this.urlPropertyMap.get('url') || '',
				createdAt: this.urlPropertyMap.get('createdAt') || '',
				updatedAt: this.urlPropertyMap.get('updatedAt') || '',
			}
	}

	fillUrlPropertyMap(key: string, value: string): void {
		if (key) {
			this.urlPropertyMap.set(key, value)
		}
	}

	processUrlFromStorage(rawUrlData: string): void {
		JSON.parse(rawUrlData, (key, value) => {
			this.fillUrlPropertyMap(key, value)
		})
	}
}

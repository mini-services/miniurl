import { StoredUrl, UrlWithInformation } from '../services/storage/types/url.js'
import { RedisStorage } from '../services/storage/drivers/redis'
import { Tedis } from 'tedis'
import { NotFoundError } from '../errors/notFound.js'
import { InvalidPayloadError } from '../errors/invalidUrl.js'

export class RedisHelper {
	private redis: Tedis
	constructor(storage: RedisStorage) {
		this.redis = storage.getRedisClient()
	}
	url: StoredUrl = {
		id: '',
		url: '',
		createdAt: '',
		updatedAt: '',
	}
	urlWithInfo: UrlWithInformation = {
		id: '',
		urlId: '',
		url: '',
		createdAt: '',
		updatedAt: '',
		ip: '',
		urlVisitCount: 0,
		infoVisitCount: 0,
		lastUsed: '',
	}

	async fetchUrlInfoFromDB(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlWithInformation> {
		const rawUrlData = (await this.redis.get(id)) as string
		if (!rawUrlData)
			throw new NotFoundError()
		this.processUrlFromStorage(rawUrlData)
		this.urlWithInfo.urlId = id
		if (!options.withInfo) {
			return this.url
	}
		else {
			return this.urlWithInfo
		}
	}

	generateUrl(key: string, value: string): void{
		switch (key) {
			case 'id':
				this.url.id = value
				this.urlWithInfo.id = value
				break
			case 'url':
				this.url.url = value
				this.urlWithInfo.url = value
				break
			case 'createdAt':
				this.url.createdAt = value
				this.urlWithInfo.createdAt = value
				break
			case 'updatedAt':
				this.url.updatedAt = value
				this.urlWithInfo.updatedAt = value
				break
			case 'ip':
				this.urlWithInfo.ip = value
				break
			case 'urlVisitCount':
				this.urlWithInfo.urlVisitCount = Number(value)
				break
			case 'infoVisitCount':
				this.urlWithInfo.infoVisitCount = Number(value)
				break
			case 'lastUsed':
				this.urlWithInfo.lastUsed = value
				break
			case 'urlId':
				this.urlWithInfo.urlId = value
				break
			case '':
				break
			default:
				console.log(InvalidPayloadError() + ' key= ' + key.toString())
		}
	}

	processUrlFromStorage(rawUrlData: string): void {
		JSON.parse(rawUrlData, (key, value) => {
			this.generateUrl(key, value)
		})
	}
}

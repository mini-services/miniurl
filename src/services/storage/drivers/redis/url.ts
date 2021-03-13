import { StoredUrl, UrlRequestData, UrlStorageDriver, UrlWithInformation } from '../../types/url.js'
import { RedisStorage } from './index.js'
import { InvalidUrl } from '../../../../errors/invalidUrl.js'
import { OperationFailed } from '../../../../errors/generalError.js'
import { config } from '../../../../config/index.js'
import cryptoRandomString from 'crypto-random-string'
import { logger } from '../../../logger/logger.js'

export class url implements UrlStorageDriver {
	storage: RedisStorage
	constructor(storage: RedisStorage) {
		this.storage = storage
	}

	async delete(id: string): Promise<void | number> {
		logger.debug('going to delete url with id = {}', id)
		const rowsDeleted: number = await this.storage.client.del(id)
		if (rowsDeleted != 0) logger.info('url deleted')
		else logger.error('url with id {} not exists in DB, nothing was deleted', id)
		return rowsDeleted
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	deleteOverdue(timespanMs: number): Promise<number> {
		//not in use since Redis has build-in mechanism to delete keys after period of time
		return Promise.resolve(-1)
	}

	async edit(id: string, url: string): Promise<StoredUrl> {
		logger.debug('fetch url info from DB for url={} with id={}', url, id)
		const dbUrl: StoredUrl = await this.storage.redisHelper.fetchUrlInfoFromDB(id, false)
		logger.debug('going update fields "updatedAt" value with current date and "url" field with new url address')
		dbUrl.updatedAt = new Date().toISOString()
		dbUrl.url = url
		if ((await this.storage.client.setex(dbUrl.id, config.url.lifetimeMs / 1000, JSON.stringify(dbUrl))) === 'OK') {
			logger.info('url modified. ttl was reset')
			return dbUrl
		} else throw new OperationFailed()
	}

	get(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlWithInformation> {
		logger.debug('fetch url from DB. url id={} withInfo = {}', id, options.withInfo)
		return this.storage.redisHelper.fetchUrlInfoFromDB(id, options.withInfo)
	}

	async incInfoCount(id: string): Promise<void> {
		if (id === 'undefined') throw new InvalidUrl()
		logger.debug('fetch url with id={}', id)
		const urlFromDb: UrlWithInformation = <UrlWithInformation>(
			await this.storage.redisHelper.fetchUrlInfoFromDB(id, true)
		)
		logger.debug('going to update "updatedAt" value and increment infoCount')
		urlFromDb.updatedAt = new Date().toISOString()
		urlFromDb.infoVisitCount = ++urlFromDb.infoVisitCount
		logger.debug('saving back in DB')
		const ttl = await this.storage.client.ttl(id)
		if ((await this.storage.client.setex(id, ttl, JSON.stringify(urlFromDb))) === 'OK') {
			logger.info('infoCount modified (ttl unchanged)')
		} else throw new OperationFailed()
	}

	async incVisitCount(id: string): Promise<void> {
		if (id === 'undefined') throw new InvalidUrl()
		logger.debug('fetch url with id={}', id)
		const urlFromDb: UrlWithInformation = <UrlWithInformation>(
			await this.storage.redisHelper.fetchUrlInfoFromDB(id, true)
		)
		logger.debug('going to update "updatedAt" value and increment visitCount')
		urlFromDb.updatedAt = new Date().toISOString()
		urlFromDb.urlVisitCount = ++urlFromDb.urlVisitCount
		logger.debug('saving back in DB')
		const ttl = await this.storage.client.ttl(id)
		if ((await this.storage.client.setex(id, ttl, JSON.stringify(urlFromDb))) === 'OK') {
			logger.info('visitCount modified  (ttl unchanged)')
		} else throw new OperationFailed()
	}

	async save(url: UrlRequestData): Promise<StoredUrl> {
		if (url.ip === 'undefined' || url.url === 'undefined') throw new InvalidUrl()
		logger.debug('going to store new url in DB. url data = {}', url)
		logger.debug('creating UrlWithInformation object... ')
		const storedUrlWithInfo = {
			id: cryptoRandomString({ length: 6, type: 'url-safe' }),
			url: url.url,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			ip: url.ip ? url.ip : undefined,
			urlVisitCount: 0,
			infoVisitCount: 0,
			lastUsed: new Date().toISOString(),
		} as UrlWithInformation
		if (
			(await this.storage.client.setex(
				storedUrlWithInfo.id,
				config.url.lifetimeMs / 1000,
				JSON.stringify(storedUrlWithInfo),
			)) === 'OK'
		) {
			logger.info('url stored in db')
			return storedUrlWithInfo
		} else throw new OperationFailed()
	}
}

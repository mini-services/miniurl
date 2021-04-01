import cryptoRandomString from 'crypto-random-string'
import { NotFoundError , GeneralError } from '../../../../errors/errors.js'
import { InMemoryStorageConfig } from '../../types/config.js'
import type { StorageDriver } from '../../types/index.js'
import type { StoredUrl, UrlWithInformation, UrlRequestData, UrlInformation } from '../../types/url.js'
export class InMemoryStorage implements StorageDriver {
	data: { urls: Map<string, StoredUrl>; urlInformation: Map<string, UrlInformation> } = {
		urls: new Map(),
		urlInformation: new Map(),
	}
	url = new (class InMemoryUrlStorage {
		constructor(public storage: InMemoryStorage) { }

		public uuid() {
			let id
			while (!id || typeof this.storage.data.urls.get(id) !== 'undefined') {
				id = cryptoRandomString({ length: 6, type: 'url-safe' })
			}

			return id
		}

		public async get(id: string, options = { withInfo: false, includeDeleted: true }): Promise<StoredUrl | UrlWithInformation> {
			const storedUrl = this.storage.data.urls.get(id)
			if (typeof storedUrl === 'undefined' || storedUrl.deletedAt) throw new NotFoundError()

			if (!options.withInfo) {
				return storedUrl
			}
			const urlInfo = this.storage.data.urlInformation.get(id)
			if (typeof urlInfo === 'undefined') throw new NotFoundError()
			return { ...storedUrl, ...urlInfo }
		}

		public async softDelete(storedUrl: StoredUrl): Promise<void> {
			const { id, url, createdAt, updatedAt } = storedUrl;
			const newStoredUrl: StoredUrl = {
				id,
				url,
				createdAt,
				updatedAt,
				deletedAt: new Date().toISOString()
			}
			this.storage.data.urls.set(id, newStoredUrl);
		}

		public async delete(id: string, options: { softDelete: boolean }): Promise<void> {
			const storedUrl = this.storage.data.urls.get(id);
			if (typeof storedUrl === 'undefined') throw new NotFoundError()

			if (!options.softDelete) {
				this.storage.data.urls.delete(id);
			} else {
				this.softDelete(storedUrl);
			}
		}

		public async deleteOverdue(timespanMs: number): Promise<number> {
			const deleteBefore = new Date().getTime() - timespanMs
			let deletedCount = 0

			this.storage.data.urls.forEach((storedUrl) => {
				const updatedAtDate = new Date(storedUrl.updatedAt).getTime()
				if (!storedUrl.deletedAt && updatedAtDate <= deleteBefore) {
					this.softDelete(storedUrl);
					deletedCount++
				}
			})

			return deletedCount
		}

		public async edit(id: string, newUrl: string): Promise<StoredUrl> {
			const storedUrl = this.storage.data.urls.get(id)
			if (typeof storedUrl === 'undefined') throw new NotFoundError()

			const newStoredUrl = { ...storedUrl, url: newUrl, updatedAt: new Date().toISOString() }
			this.storage.data.urls.set(id, newStoredUrl)

			return newStoredUrl
		}

		public async save(requestData: UrlRequestData): Promise<StoredUrl> {
			if (requestData.id && this.storage.data.urls.has(requestData.id)) {
				throw new GeneralError('The specific id you chose is already in use')
			}
			const storedUrl = {
				id: requestData.id || this.uuid(),
				url: requestData.url,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			} as StoredUrl

			const storedUrlInfo = {
				ip: requestData.ip,
				urlVisitCount: 0,
				infoVisitCount: 0,
				lastUsed: new Date().toISOString(),
			}
			this.storage.data.urls.set(storedUrl.id, storedUrl)
			this.storage.data.urlInformation.set(storedUrl.id, storedUrlInfo)

			return storedUrl
		}

		public async incVisitCount(id: string): Promise<void> {
			const urlInfo = this.storage.data.urlInformation.get(id)
			if (typeof urlInfo === 'undefined') throw new NotFoundError()
			urlInfo.urlVisitCount++
			urlInfo.lastUsed = new Date().toISOString()
			this.storage.data.urlInformation.set(id, urlInfo)
		}

		public async incInfoCount(id: string): Promise<void> {
			const urlInfo = this.storage.data.urlInformation.get(id)
			if (typeof urlInfo === 'undefined') throw new NotFoundError()
			urlInfo.infoVisitCount++
			urlInfo.lastUsed = new Date().toISOString()
			this.storage.data.urlInformation.set(id, urlInfo)
		}
	})(this)

	public async initialize(): Promise<void> {
		return
	}
	public async shutdown(): Promise<void> {
		return
	}

	// eslint-disable-next-line
	constructor(public config: InMemoryStorageConfig) {
	}
}

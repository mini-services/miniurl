import cryptoRandomString from 'crypto-random-string'
import { NotFoundError } from '../../../../errors/notFound.js'
import { InMemoryStorageConfig } from '../../types/config.js'
import type { StorageDriver } from '../../types/index.js'
import type { StoredUrl } from '../../types/url.js'

export class InMemoryStorage implements StorageDriver {
	// eslint-disable-next-line
	constructor(public config: InMemoryStorageConfig) {}
	data: { urls: Map<string, StoredUrl> } = {
		urls: new Map(),
	}
	public async initialize(): Promise<void> {
		return
	}

	url = new (class InMemoryUrlStorage {
		constructor(public storage: InMemoryStorage) {}
		public uuid() {
			let id
			while (!id || typeof this.storage.data.urls.get(id) !== 'undefined') {
				id = cryptoRandomString({ length: 6, type: 'url-safe' })
			}

			return id
		}
		public async get(id: string): Promise<StoredUrl> {
			const storedUrl = this.storage.data.urls.get(id)
			if (typeof storedUrl === 'undefined') throw new NotFoundError()

			return storedUrl
		}
		public async delete(id: string): Promise<void> {
			if (typeof this.storage.data.urls.get(id) === 'undefined') throw new NotFoundError()

			this.storage.data.urls.delete(id)
		}
		public async deleteOverdue(timespanMs: number): Promise<number> {
			const deleteBefore = new Date().getTime() - timespanMs
			let deletedCount = 0

			this.storage.data.urls.forEach((storedUrl) => {
				const updatedAt = new Date(storedUrl.updatedAt).getTime()
				if (updatedAt <= deleteBefore) {
					this.storage.data.urls.delete(storedUrl.id)
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
		public async save(url: string): Promise<StoredUrl> {
			const storedUrl = {
				id: this.uuid(),
				url,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			this.storage.data.urls.set(storedUrl.id, storedUrl)

			return storedUrl
		}
	})(this)
}

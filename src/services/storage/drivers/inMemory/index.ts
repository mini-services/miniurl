import cryptoRandomString from 'crypto-random-string'
import { NotFoundError } from '../../../../errors/notFound.js'
import { InMemoryStorageConfig } from '../../types/config.js'
import { StorageDriver } from '../../types/index.js'
import { StoredUrl } from '../../types/url.js'

export class InMemoryStorage implements StorageDriver {
	// eslint-disable-next-line
	constructor(public config: InMemoryStorageConfig) {}
	data: { urls: Record<string, StoredUrl> } = {
		urls: {},
	}
	public async initialize(): Promise<void> {
		return
	}

	url = new (class In {
		constructor(public storage: InMemoryStorage) {}
		public uuid() {
			let id
			while (!id || typeof this.storage.data.urls[id] !== 'undefined') {
				id = cryptoRandomString({ length: 6, type: 'url-safe' })
			}

			return id
		}
		public async get(id: string): Promise<StoredUrl> {
			if (typeof this.storage.data.urls[id] === 'undefined') throw new NotFoundError()

			return this.storage.data.urls[id]
		}
		public async delete(id: string): Promise<void> {
			if (typeof this.storage.data.urls[id] === 'undefined') throw new NotFoundError()

			delete this.storage.data.urls[id]
		}
		public async edit(id: string, newUrl: string): Promise<StoredUrl> {
			if (typeof this.storage.data.urls[id] === 'undefined') throw new NotFoundError()

			this.storage.data.urls[id].url = newUrl
			this.storage.data.urls[id].updatedAt = new Date().toISOString()

			return this.storage.data.urls[id]
		}
		public async save(url: string): Promise<StoredUrl> {
			const storedUrl = {
				id: this.uuid(),
				url,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			this.storage.data.urls[storedUrl.id] = storedUrl

			return storedUrl
		}
	})(this)
}

import cryptoRandomString from 'crypto-random-string'
import { NotFoundError } from '../../../../../errors/notFound.js'
import { StoredUrl, UrlStorageDriver } from '../../types'
import { InMemoryUrlStorageDriverConfig } from './types'

export class InMemoryUrlStorage implements UrlStorageDriver {
	// eslint-disable-next-line
	constructor(config: InMemoryUrlStorageDriverConfig) {}
	data: Record<string, StoredUrl> = {}
	public async initialize(): Promise<void> {
		return
	}
	private uuid() {
		let id
		while (!id || typeof this.data[id] !== 'undefined') {
			id = cryptoRandomString({ length: 6, type: 'url-safe' })
		}

		return id
	}
	public async get(id: string): Promise<StoredUrl> {
		if (typeof this.data[id] === 'undefined') throw new NotFoundError()

		return this.data[id]
	}
	public async delete(id: string): Promise<void> {
		if (typeof this.data[id] === 'undefined') throw new NotFoundError()

		delete this.data[id]
	}
	public async edit(id: string, newUrl: string): Promise<StoredUrl> {
		if (typeof this.data[id] === 'undefined') throw new NotFoundError()

		this.data[id].url = newUrl
		this.data[id].updatedAt = new Date().toISOString()

		return this.data[id]
	}
	public async save(url: string): Promise<StoredUrl> {
		const storedUrl = {
			id: this.uuid(),
			url,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
		this.data[storedUrl.id] = storedUrl

		return storedUrl
	}
}

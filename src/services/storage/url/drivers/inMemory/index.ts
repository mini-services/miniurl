import cryptoRandomString from 'crypto-random-string'
import { NotFoundError } from '../../../../../errors/notFound'
import { UrlStorageDriver } from '../../types'
import { InMemoryUrlStorageDriverConfig } from './types'

export class InMemoryUrlStorage implements UrlStorageDriver {
	// eslint-disable-next-line
	constructor(config: InMemoryUrlStorageDriverConfig) {}
	data: Record<string, string> = {}
	private uuid() {
		let id
		while (!id || this.data[id] !== 'undefined') {
			id = cryptoRandomString({ length: 6, type: 'url-safe' })
		}

		return id
	}
	public async get(id: string): Promise<string> {
		if (this.data[id] === 'undefined') throw new NotFoundError()

		return this.data[id]
	}
	public async delete(id: string): Promise<string> {
		if (this.data[id] === 'undefined') throw new NotFoundError()

		const url = this.data[id]
		delete this.data[id]

		return url
	}
	public async edit(id: string, url: string): Promise<string> {
		if (this.data[id] === 'undefined') throw new NotFoundError()

		return (this.data[id] = url)
	}
	public async save(url: string): Promise<string> {
		const id = this.uuid()
		this.data[id] = url

		return id
	}
}

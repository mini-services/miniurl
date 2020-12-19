export interface StoredUrl {
	id: string
	url: string
	createdAt: string
	updatedAt: string
}

export interface UrlStorageDriver {
	initialize(): Promise<void>
	get(id: string): Promise<StoredUrl>
	save(url: string): Promise<StoredUrl>
	edit(id: string, url: string): Promise<StoredUrl>
	delete(id: string): Promise<void>
}

export interface StoredUrl {
	id: string
	url: string
	lastUsed: string
	updatedAt: string
}

export interface UrlStorageDriver {
	get(id: string): Promise<StoredUrl>
	save(url: string): Promise<StoredUrl>
	edit(id: string, url: string): Promise<StoredUrl>
	delete(id: string): Promise<void>
	deleteOverdue(timespanMs: number): Promise<number>
}

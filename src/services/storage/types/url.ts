export interface StoredUrl {
	id: string
	url: string
	createdAt: string
	updatedAt: string
}

export interface UrlStorageDriver {
	get(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlInformation>

	save(url: UrlRequestData): Promise<StoredUrl>

	edit(id: string, url: string): Promise<StoredUrl>

	delete(id: string): Promise<void>

	deleteOverdue(timespanMs: number): Promise<number>

	incVisitCount(id: string): Promise<void>

	incInfoCount(id: string): Promise<void>
}

export interface UrlRequestData {
	url: string
	ip: string
}

export interface UrlInformation {
	urlId: string
	ip: string
	urlVisitCount: number
	infoVisitCount: number
	lastUsed: string
}
export type UrlWithInformation = StoredUrl & UrlInformation

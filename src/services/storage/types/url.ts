export interface StoredUrl {
	id: string
	url: string
	createdAt: string
	updatedAt: string
}

export interface UrlStorageDriver {
	get(id: string, options: { withInfo: boolean }): Promise<StoredUrl | UrlWithInformation>

	save(url: UrlRequestData): Promise<StoredUrl>

	edit(id: string, url: string): Promise<StoredUrl>

	delete(id: string): Promise<void>

	deleteOverdue(timespanMs: number): Promise<number>

	incVisitCount(id: string): void

	incInfoCount(id: string): void
}

export interface UrlRequestData {
	url: string
	id?: string
	ip: string
	requestUrl: string
}

export interface UrlInformation {
	ip: string
	urlVisitCount: number
	infoVisitCount: number
	lastUsed: string
	requestUrl: string
}
export type UrlWithInformation = StoredUrl & UrlInformation

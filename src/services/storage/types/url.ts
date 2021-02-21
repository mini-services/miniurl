export interface StoredUrl {
	id: string
	url: string
	createdAt: string
	updatedAt: string
}

export interface UrlStorageDriver {
	get(id: string): Promise<UrlResponse>

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
	mobile?: boolean
}

export interface UrlInformation extends StoredUrl {
	urlId: string
	ip: string
	urlVisitCount: number
	infoVisitCount: number
	region?: string
	mobile: boolean
	lastUse: string
}

export interface UrlResponse {
	storedUrl: StoredUrl
	urlInfo: UrlInformation
}

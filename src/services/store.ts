const data: Record<string, string> = {}

let _id = 0
const uid = () => (++_id + '').padStart(6, '0')
class Store {
	saveUrl(url: string) {
		const id = uid()
		data[id] = url
		return id
	}
	getUrl(id: string) {
		return data[id]
	}
	removeUrl(id: string) {
		delete data[id]
	}
}

export const store = new Store()

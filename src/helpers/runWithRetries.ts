import { makeDestructuredPromise } from './makeDestructuredPromise.js'

interface Config {
	retries: number
	retryTime: number
	silent: boolean
	name: string
}

const defaults: Config = { retries: 6, retryTime: 5000, silent: false, name: 'Task' }

export async function runWithRetries<T>(func: () => T, initialConfig?: Partial<Config>): Promise<T> {
	const config = { ...defaults, ...initialConfig }
	const { promise, reject, resolve } = makeDestructuredPromise<T>()

	try {
		resolve(await func())
	} catch (e) {
		if (!config.silent) {
			console.warn(e)
			console.warn(`${config.name} failed. Retrying again in ${config.retryTime}ms`)
		}
		if (config.retries <= 1) return Promise.reject('ERROR_RETRIES_FAILED')
		setTimeout(() => {
			return runWithRetries(func, { ...config, retries: config.retries - 1 }).then(resolve, reject)
		}, config.retryTime)
	}

	return promise
}

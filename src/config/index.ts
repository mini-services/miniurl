import type { Config } from './types.js'
import { generateConfig } from './generate.js'

let config: Config

function getConfig({ useCache = true }: { useCache?: boolean } = { useCache: true }): Config {
	if (config && useCache) return config

	config = generateConfig()
	return config
}

export { getConfig }

import type { Config } from './types.js'
import { generateConfig } from './generate.js'

let config: Config

function getConfig(): Config {
	if (config) return config

	config = generateConfig()

	return config
}

export { getConfig }

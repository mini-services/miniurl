import { FastifyRequest } from 'fastify'
import { InvalidConfigError } from '../../errors/invalidConfig.js'
import { BearerTokenAuth } from './drivers/bearerToken/index.js'
import type { AuthDriver } from './types'
import { AuthConfig, AuthDriverName } from './types/config.js'

export class Auth implements AuthDriver {
	constructor(private _config: AuthConfig) {
		switch (_config.driverName) {
			case AuthDriverName.BearerToken:
				this._driver = new BearerTokenAuth(_config.driverConfig)
				break
			default:
				throw new InvalidConfigError(`Invalid url storage driver selected.`)
		}
	}

	private _driver: AuthDriver

	get driver(): AuthDriver {
		return this._driver
	}

	get config(): AuthConfig {
		return this._config
	}

	public async isAuthorized(request: FastifyRequest): Promise<boolean> {
		return this._driver.isAuthorized(request)
	}

	public authorize(request: FastifyRequest): Promise<void> {
		return this._driver.authorize(request)
	}
}

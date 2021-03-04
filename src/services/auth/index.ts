import { FastifyRequest } from 'fastify'
import { InvalidConfigError } from '../../errors/invalidConfig.js'
import { BearerTokenAuth } from './drivers/bearerToken/index.js'
import type { AuthDriver } from './types'
import { AuthConfig, AuthDriverName } from './types/config.js'
import { logger } from '../logger/logger.js'

export class Auth implements AuthDriver {
	private _driver: AuthDriver
	constructor(private _config: AuthConfig) {
		switch (_config.driverName) {
			case AuthDriverName.BearerToken:
				this._driver = new BearerTokenAuth(_config.driverConfig)
				break
			default:
				throw new InvalidConfigError(`Invalid url storage driver selected.`)
		}
	}

	get config(): AuthConfig {
		return this._config
	}

	get driver(): AuthDriver {
		return this._driver
	}

	public async isAuthorized(request: FastifyRequest): Promise<boolean> {
		logger.debug(`Running Auth.isAuthorized`)
		return this._driver.isAuthorized(request)
	}
	public authorize(request: FastifyRequest): Promise<void> {
		logger.debug(`Running Auth.authorize`)
		return this._driver.authorize(request)
	}
}

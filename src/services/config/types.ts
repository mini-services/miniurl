import Knex from 'knex'
import { StorageDriverName } from '../storage/types'

export interface RawConfig {
	port: string
	appName: string
	baseRedirectUrl: string
	storage: {
		driver: string
		connection: {
			host: string
			user: string
			password: string
			database: string
		}
	}
}

export interface Config {
	port: string
	appName: string
	baseRedirectUrl: string
	storage: {
		driver: StorageDriverName
	}
	storageDriver: StorageDriverName
	connection: Knex.Config['connection']
}

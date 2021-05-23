import { runApp } from './utils'
import { describe, it, expect, afterAll, beforeAll } from '@jest/globals'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CUSTOM_ID = 'custom-id'

const testTable: [string, Record<string, string>][] = [
	[
		'Sqlite storage',
		{
			STORAGE_DRIVER: 'Sqlite',
			SQLITE_STORAGE_FILENAME: join(__dirname, `../../test-db-${Date.now()}.sqlite`),
		},
	],
	['InMemory storage', { STORAGE_DRIVER: 'InMemory' }],
	[
		'Postgres storage',
		{
			STORAGE_DRIVER: 'Postgres',
			POSTGRES_STORAGE_DATABASE: 'postgres',
			POSTGRES_STORAGE_HOST: 'localhost',
			POSTGRES_STORAGE_USER: 'postgres',
			POSTGRES_STORAGE_PASSWORD: 'postgres',
		},
	],
]

let app: Awaited<ReturnType<typeof runApp>>
describe.each(testTable)('MiniUrl with %s', (configName, envVariables) => {
	beforeAll(async () => {
		app = await runApp(envVariables)
	})

	afterAll(async () => {
		// await app.storage.wipeData({ iUnderstandThatThisIsIrreversible: true })
		await app.shutdown()
	})

	describe('Health check', () => {
		it("GET /healthz should return 200 'OK'", async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/healthz',
			})

			expect(response.statusCode).toBe(200)
			expect(response.body).toBe('OK')
		})
	})

	describe('Save url', () => {
		it('Should successfully save and retrieve a URL', async () => {
			const saveResponse = await app.inject({
				method: 'POST',
				url: `${app.config.apiPrefix}/url`,
				payload: {
					url: 'https://snir.sh',
				},
			})

			expect(saveResponse.statusCode).toBe(200)
			expect(saveResponse.body).toContain(`${app.config.baseRedirectUrl}`)

			const getResponse = await app.inject({
				method: 'GET',
				url: new URL(saveResponse.body).pathname,
			})

			expect(getResponse.statusCode).toBe(200)
		})
		it('Should successfully save and retrieve a URL with a custom id', async () => {
			const saveResponse = await app.inject({
				method: 'POST',
				url: `${app.config.apiPrefix}/url`,
				headers: { Authorization: `Bearer ${app.config.auth.driverConfig.token}` },
				payload: {
					url: 'https://snir.sh2',
					id: CUSTOM_ID,
				},
			})

			expect(saveResponse.statusCode).toBe(200)
			expect(saveResponse.body).toBe(`${app.config.baseRedirectUrl}${CUSTOM_ID}`)

			const getResponse = await app.inject({
				method: 'GET',
				url: new URL(saveResponse.body).pathname,
			})

			expect(getResponse.statusCode).toBe(200)
		})
	})

	describe('Get url', () => {
		it('Should successfully retrieve a URL with all details', async () => {
			const saveResponse = await app.inject({
				method: 'POST',
				url: `${app.config.apiPrefix}/url`,
				payload: {
					url: 'https://snir.sh',
				},
			})

			expect(saveResponse.statusCode).toBe(200)

			const url = saveResponse.body
			const splitUrl = url.split('/')
			const id = splitUrl[splitUrl.length - 1]

			const getResponse = await app.inject({
				method: 'GET',
				url: `${app.config.apiPrefix}/url/${id}`,
			})

			expect(getResponse.statusCode).toBe(200)
			expect(getResponse.body).toMatchObject({
				id,
				url,
			})
			expect(getResponse.body.createdAt).toMatch
		})
		it('Should successfully save a URL with a custom id', async () => {
			const id = 'custom-id'
			const response = await app.inject({
				method: 'POST',
				url: `${app.config.apiPrefix}/url`,
				headers: { Authorization: `Bearer ${app.config.auth.driverConfig.token}` },
				payload: {
					url: 'https://snir.sh2',
					id,
				},
			})
			expect(response.statusCode).toBe(200)
			expect(response.body).toBe(`${app.config.baseRedirectUrl}${id}`)
		})
	})
})

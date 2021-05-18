import { runApp } from './utils'
import { describe, it, expect, afterAll, beforeAll } from '@jest/globals'
import { join } from 'path'
import { cwd } from 'process'

const sqliteDbPath = join(cwd(), './test-db.sqlite')

const testTable: [string, Record<string, string>][] = [
	[
		'Sqlite storage',
		{
			STORAGE_DRIVER: 'Sqlite',
			SQLITE_STORAGE_FILENAME: sqliteDbPath,
			BASE_REDIRECT_URL: 'http://localhost:8000/u/',
			PORT: '8000',
		},
	],
	['InMemory storage', { STORAGE_DRIVER: 'InMemory', BASE_REDIRECT_URL: 'http://localhost:8001/u/', PORT: '8001' }],
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
			const response = await app.inject({
				method: 'POST',
				url: `${app.config.apiPrefix}/url`,
				payload: {
					url: 'https://snir.sh',
				},
			})

			expect(response.statusCode).toBe(200)
			expect(response.body).toContain(`${app.config.baseRedirectUrl}`)
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

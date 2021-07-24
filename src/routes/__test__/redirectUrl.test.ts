import { mockId } from '../../services/storage/__test__/mock.js'
import { mockCreateApp } from '../../__test__/mockApp.js'
import { routes } from '../index.js'
import { jest, expect, test } from '@jest/globals'

test('GET /u/:id route', async () => {
	const app = await mockCreateApp()
	const storedUrl = {
		id: '123',
		url: 'http://test.url',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}
	app.storage = { url: { get: jest.fn(() => Promise.resolve(storedUrl)) } } as any
	app.register(routes)

	const response = await app.inject({
		method: 'GET',
		url: `${app.config.baseRedirectUrl}${mockId}`,
	})

	expect(response.statusCode).toBe(302)
	expect(response.headers.location).toBe(storedUrl.url)
})

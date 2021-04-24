import { mockId } from '../../services/storage/__test__/mock.js'
import { mockCreateApp } from '../../__test__/mockApp.js'
import { routes } from '../index.js'

test('GET /url/:id route', async () => {
	const app = await mockCreateApp()
	const storedUrl = {
		id: '123',
		url: 'http://test.url',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}

	app.storage = { url: { get: jest.fn().mockResolvedValue(storedUrl) } } as any
	app.register(routes)

	const response = await app.inject({
		method: 'GET',
		url: `${app.config.apiPrefix}/url/${mockId}`,
	})

	expect(response.statusCode).toBe(200)
	expect(JSON.parse(response.body)).toEqual(storedUrl)
})

import { mockCreateApp } from '../../__test__/mockApp'
import { routes } from '../index'
import { mockId } from '../../services/storage/__test__/mock'

test('PUT /url/:id', async () => {
	const app = await mockCreateApp()
	app.register(routes)

	const urlMock = 'https://twitter.com/elonmusk'

	const storedUrl = {
		id: mockId,
		url: urlMock,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}
	app.storage = { url: { edit: jest.fn().mockResolvedValue(storedUrl) } } as any

	const response = await app.inject({
		method: 'PUT',
		url: `${app.config.apiPrefix}/url/${mockId}`,
		payload: {
			url: urlMock,
		},
	})

	expect(app.storage.url.edit).toBeCalledWith(mockId, urlMock)
	expect(response.statusCode).toBe(200)
	expect(JSON.parse(response.body).url).toEqual(urlMock)
})

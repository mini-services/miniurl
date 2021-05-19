import { mockCreateApp } from '../../__test__/mockApp'
import { routes } from '../index'
import { mockId } from '../../services/storage/__test__/mock'

test('DELETE /url/:id', async () => {
	const app = await mockCreateApp()
	app.register(routes)

	app.storage = { url: { delete: jest.fn().mockResolvedValue(true) } } as any

	const response = await app.inject({
		method: 'DELETE',
		url: `${app.config.apiPrefix}/url/${mockId}`,
	})

	expect(app.storage.url.delete).toBeCalledWith(mockId)
	expect(response.statusCode).toBe(200)
	expect(response.body).toBeTruthy()
})

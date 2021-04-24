import { mockCreateApp } from '../../__test__/mockApp.js'
import { routes } from '../index.js'

test('GET /healthz route', async () => {
	const app = await mockCreateApp()
	app.register(routes)

	const response = await app.inject({
		method: 'GET',
		url: '/healthz',
	})

	expect(response.statusCode).toBe(200)
	expect(response.body).toBe('OK')
})

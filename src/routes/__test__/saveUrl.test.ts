import { mockId } from '../../services/storage/__test__/mock.js'
import { mockCreateApp } from '../../__test__/mockApp.js'
import { routes } from '../index.js'

test('POST /url route', async () => {
	const app = await mockCreateApp()
	app.register(routes)

	const response = await app.inject({
		method: 'POST',
		url: `${app.config.apiPrefix}/url`,
		payload: {
			url: 'https://snir.sh',
		},
	})

	expect(response.statusCode).toBe(200)
	expect(response.body).toBe(app.config.baseRedirectUrl + mockId)
})

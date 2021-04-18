import { getConfig } from '..'
import { generateConfig } from '../generate'
import { mockGetConfig } from './mock'

jest.mock('../generate', () => {
	// Works and lets you check for constructor calls:
	return {
		generateConfig: jest.fn().mockImplementation(() => mockGetConfig()),
	}
})
test('getConfig ', () => {
	process.env.BASE_REDIRECT_URL = 'http://doesnt-matter.com'
	process.env.STORAGE_DRIVER = 'InMemory'
	const config = getConfig()
	const config2 = getConfig()

	expect(generateConfig).toBeCalledTimes(1)
	expect(config2).toBe(config)
})

import { getConfig } from '..'
import { test, expect } from '@jest/globals'

test('getConfig keeps the config in cache', () => {
	process.env.BASE_REDIRECT_URL = 'http://doesnt-matter.com'
	process.env.STORAGE_DRIVER = 'InMemory'
	const config = getConfig()
	const config2 = getConfig()

	expect(config2).toBe(config)
})

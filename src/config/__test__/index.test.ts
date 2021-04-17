import { validateConfig } from '../validate'
import { getRawConfig } from './helpers'

test('Happy flow', () => {
	expect(validateConfig(getRawConfig())).toBe(true)
})

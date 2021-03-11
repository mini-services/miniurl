import test from 'ava'
import { validateConfig } from '../validate'
import { getRawConfig } from './helpers'

test('Happy flow', (t) => {
	t.true(validateConfig(getRawConfig()))
})

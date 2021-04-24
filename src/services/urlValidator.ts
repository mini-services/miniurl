import micromatch from 'micromatch'
import { InvalidUrl } from '../errors/errors.js'

export async function validateUrl(url: string, matchPattern: string): Promise<void> {
	const matcher = micromatch.matcher(matchPattern)
	if (!matcher(url)) throw new InvalidUrl('Url does not match specified pattern')
}

import { config } from '../config/index.js'
import micromatch from 'micromatch'
import { InvalidUrl } from '../errors/invalidUrl.js'

const matcher = micromatch.matcher(config.url.matchPattern)
export async function validateUrl(url: string): Promise<void> {
	if (!matcher(url)) throw new InvalidUrl('Url does not match specified pattern')
}

import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^\\.(.*)\\.js$': '.$1',
	},
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	extensionsToTreatAsEsm: ['.ts'],
	collectCoverageFrom: ['src/**/*'],
	clearMocks: true,
	roots: ['src', 'tests'],
	globals: {
		'ts-jest': {
			useESM: true,
		},
	},
}

export default config

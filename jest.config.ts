import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^(.*)\\.js$': '$1',
	},
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	collectCoverageFrom: ['src/**/*'],
	clearMocks: false,
	roots: ['src'],
	timers: 'real',
}

export default config

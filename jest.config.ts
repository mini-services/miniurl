export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^(.*)\\.js$': '$1',
	},
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	// coverageReporters: ['lcov'],
	clearMocks: false,
	roots: ['src/test'],
	timers: 'real',
}

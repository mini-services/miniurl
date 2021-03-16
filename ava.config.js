export default {
	verbose: true,
	files: ['**/*.test.[jt]s'],
	require: ['ts-node/register'],
	timeout: '1m',
	failFast: true,
	nodeArguments: [
		"--loader=ts-node/esm",
		"--experimental-specifier-resolution=node"
	],
	extensions: {
		"ts": "module"
	},
	nonSemVerExperiments: {
		"configurableModuleFormat": true
	  },
}

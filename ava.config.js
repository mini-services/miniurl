export default {
	verbose: true,
	files: ['**/*.test.[jt]s'],
	require: ['ts-node/register'],
	timeout: '1m',
	faileFast: true,
	extensions: ['ts', 'js'],
}
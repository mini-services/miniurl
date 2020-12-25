export function makeDestructuredPromise<T>(): {
	promise: Promise<T>
	resolve: (value: T) => void
	reject: (value: unknown) => void
} {
	/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
	let resolve = (_value: T) => {}
	let reject = (_value: unknown) => {}
	/* eslint-enable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})

	return { promise, resolve, reject }
}

// This type gets T from Promise<T>
// e.g Awaited<Promise<T>> === T
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T

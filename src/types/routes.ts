import { RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault, RouteOptions } from 'fastify'
import { RouteGenericInterface } from 'fastify/types/route'

export type Route<T extends RouteGenericInterface> = RouteOptions<
	RawServerDefault,
	RawRequestDefaultExpression,
	RawReplyDefaultExpression,
	T
>

import { jest } from '@jest/globals'

export const mockId = '123'
export const mockSave = jest.fn().mockImplementation(() => ({ id: mockId }))

export const mockGet = jest.fn().mockImplementation(() => ({ id: mockId }))

export const mockInitialize = jest.fn()
export const mockShutdown = jest.fn()
export const MockStorage = jest.fn().mockImplementation(() => {
	return {
		initialize: mockInitialize,
		shutdown: mockShutdown,
		url: {
			save: mockSave,
			get: mockGet,
		},
	}
})

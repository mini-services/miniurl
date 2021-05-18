import { jest } from '@jest/globals'

const mockIsAuthorized = jest.fn().mockReturnValue(Promise.resolve(true))
export const MockAuth = jest.fn().mockImplementation(() => {
	return {
		isAuthorized: mockIsAuthorized,
	}
})

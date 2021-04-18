const mockIsAuthorized = jest.fn().mockResolvedValue(true)
export const MockAuth = jest.fn().mockImplementation(() => {
	return {
		isAuthorized: mockIsAuthorized,
	}
})

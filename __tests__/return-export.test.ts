import Returns, { ReturnStatus } from '../src/lib/resources/Return';

describe('Returns.exportData', () => {
  it('requests arraybuffer response type and returns a Buffer', async () => {
    const mockRequest = jest.fn().mockResolvedValue(Uint8Array.from([1, 2]));
    const returns = new Returns({ request: mockRequest } as any);

    const result = await returns.exportData({ status: ReturnStatus.APPROVED }, 'json');

    expect(mockRequest).toHaveBeenCalledWith(
      'GET',
      expect.stringContaining('returns/export'),
      null,
      { responseType: 'arraybuffer' }
    );
    const requestedPath = mockRequest.mock.calls[0][1] as string;
    expect(requestedPath).toContain('status=APPROVED');
    expect(requestedPath).toContain('format=json');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.equals(Buffer.from([1, 2]))).toBe(true);
  });
});

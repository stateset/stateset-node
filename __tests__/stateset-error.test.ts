import {
  StatesetError,
  StatesetAPIError,
  StatesetAuthenticationError,
  StatesetConnectionError,
  StatesetInvalidRequestError,
  StatesetNotFoundError,
  StatesetPermissionError,
  StatesetRateLimitError,
} from '../src';

describe('StatesetError', () => {
  it('generates strongly typed errors', () => {
    expect(
      StatesetError.generate({ type: 'invalid_request_error', message: 'bad request' })
    ).toBeInstanceOf(StatesetInvalidRequestError);
    expect(
      StatesetError.generate({ type: 'api_error', message: 'server exploded' })
    ).toBeInstanceOf(StatesetAPIError);
    expect(
      StatesetError.generate({ type: 'authentication_error', message: 'nope' })
    ).toBeInstanceOf(StatesetAuthenticationError);
    expect(
      StatesetError.generate({ type: 'connection_error', message: 'timeout' })
    ).toBeInstanceOf(StatesetConnectionError);
    expect(
      StatesetError.generate({ type: 'not_found_error', message: 'missing' })
    ).toBeInstanceOf(StatesetNotFoundError);
    expect(
      StatesetError.generate({ type: 'permission_error', message: 'forbidden' })
    ).toBeInstanceOf(StatesetPermissionError);
    expect(
      StatesetError.generate({ type: 'rate_limit_error', message: 'slow down' })
    ).toBeInstanceOf(StatesetRateLimitError);
  });

  it('normalizes unknown error types to StatesetError', () => {
    const err = StatesetError.generate({ type: 'custom_error', message: 'whoops' });
    expect(err).toBeInstanceOf(StatesetError);
    expect(err.type).toBe('custom_error');
  });

  it('captures raw metadata in permission error', () => {
    const raw = {
      type: 'permission_error',
      message: 'forbidden',
      statusCode: 403,
      code: 'forbidden',
      request_id: 'req_123',
    };
    const err = new StatesetPermissionError(raw);
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('forbidden');
    expect(err.toJSON()).toMatchObject(raw);
  });
});

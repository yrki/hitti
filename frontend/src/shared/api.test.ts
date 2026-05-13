import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiFetch, setAuthToken } from './api';

function mockFetchResponse(body: unknown, init?: { status?: number; ok?: boolean; statusText?: string }) {
  const status = init?.status ?? 200;
  const ok = init?.ok ?? (status >= 200 && status < 300);
  return {
    ok,
    status,
    statusText: init?.statusText ?? '',
    json: () => Promise.resolve(body),
  } as Response;
}

describe('apiFetch', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
    // Replace window.location with a mutable stub so we can observe redirects.
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { href: '' } as Location,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  it('should_send_Authorization_header_when_token_exists', async () => {
    // Arrange
    setAuthToken('abc-123');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockFetchResponse({ ok: true }));

    // Act
    await apiFetch('/test');

    // Assert
    const call = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = (call[1] as RequestInit).headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer abc-123');
  });

  it('should_omit_Authorization_header_when_token_missing', async () => {
    // Arrange
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockFetchResponse({ ok: true }));

    // Act
    await apiFetch('/test');

    // Assert
    const call = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = (call[1] as RequestInit).headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('should_clear_token_and_redirect_to_login_on_401', async () => {
    // Arrange
    setAuthToken('expired');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      mockFetchResponse({ message: 'no' }, { status: 401, ok: false, statusText: 'Unauthorized' })
    );

    // Act
    const promise = apiFetch('/secret');

    // Assert
    await expect(promise).rejects.toThrow('Unauthorized');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('should_return_parsed_json_on_200', async () => {
    // Arrange
    const payload = { id: 42, name: 'Børre' };
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockFetchResponse(payload));

    // Act
    const result = await apiFetch<typeof payload>('/me');

    // Assert
    expect(result).toEqual(payload);
  });

  it('should_throw_when_response_is_not_ok', async () => {
    // Arrange
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      mockFetchResponse({}, { status: 500, ok: false, statusText: 'Server Error' })
    );

    // Act
    const promise = apiFetch('/boom');

    // Assert
    await expect(promise).rejects.toThrow('API error: 500 Server Error');
  });
});

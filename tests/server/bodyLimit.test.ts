import { describe, expect, it } from 'vitest';
import { bodyLimitStatus, maxBodySize } from '../../server/utils/bodyLimit';

describe('bodyLimitStatus', () => {
  it('accepts bodies up to the limit', () => {
    expect(bodyLimitStatus('POST', '/api/payment/webhook', { contentLength: '42' })).toBeUndefined();
    expect(bodyLimitStatus('PATCH', '/api/spaces/1', { contentLength: String(maxBodySize) })).toBeUndefined();
  });

  it('rejects larger bodies and bodies of unknown size', () => {
    expect(bodyLimitStatus('POST', '/api/payment/webhook', { contentLength: String(maxBodySize + 1) })).toBe(413);
    expect(bodyLimitStatus('PUT', '/api/spaces/1/map-objects?x=1', { contentLength: 'abc' })).toBe(413);
    expect(bodyLimitStatus('POST', '/api/payment/webhook', { transferEncoding: 'chunked' })).toBe(411);
  });

  it('leaves requests without body and the image upload alone', () => {
    expect(bodyLimitStatus('GET', '/api/spaces', { contentLength: String(maxBodySize + 1) })).toBeUndefined();
    expect(bodyLimitStatus('POST', '/api/spaces/1/image', { contentLength: String(maxBodySize + 1) })).toBeUndefined();
    expect(bodyLimitStatus('DELETE', '/api/bookings/1', {})).toBeUndefined();
  });
});

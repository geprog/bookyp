import { describe, expect, it } from 'vitest';
import { parseWebUrl } from '../../shared/utils/urls';

describe('parseWebUrl', () => {
  it('accepts absolute http(s) urls', () => {
    expect(parseWebUrl('https://example.com/a?b#c')?.href).toBe('https://example.com/a?b#c');
    expect(parseWebUrl('HTTP://example.com')?.href).toBe('http://example.com/');
  });

  it('rejects other schemes and relative urls', () => {
    for (const value of ['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'mailto:a@b.c', 'example.com', '/path', '']) {
      expect(parseWebUrl(value)).toBeUndefined();
    }
  });
});

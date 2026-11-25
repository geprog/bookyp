// cspell:ignore AQABAIAAAAAAAP BAEAAAAALAAAAAABAAEAAAIBRAA WEBPVP
import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { detectImageType } from '../../server/utils/images';

/** a 1x1 png */
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
/** a 1x1 gif */
const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

describe('detectImageType', () => {
  it('detects the accepted raster formats', async () => {
    expect(await detectImageType(png)).toBe('image/png');
    expect(await detectImageType(gif)).toBe('image/gif');
    expect(await detectImageType(Uint8Array.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00]))).toBe('image/jpeg');
    expect(await detectImageType(Buffer.from('RIFF\0\0\0\0WEBPVP8 '))).toBe('image/webp');
  });

  it('rejects everything else', async () => {
    expect(await detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeUndefined();
    expect(await detectImageType(Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeUndefined();
    expect(await detectImageType(Buffer.from('<!doctype html><script>alert(1)</script>'))).toBeUndefined();
    // a known type that is not an accepted image
    expect(await detectImageType(Buffer.from('%PDF-1.4\n'))).toBeUndefined();
    expect(await detectImageType(new Uint8Array())).toBeUndefined();
  });
});

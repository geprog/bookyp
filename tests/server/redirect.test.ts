import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from '../../server/utils/redirect';

describe('safeRedirectPath', () => {
  it('keeps paths of the app', () => {
    expect(safeRedirectPath('/')).toBe('/');
    expect(safeRedirectPath('/space/123?tab=map#top')).toBe('/space/123?tab=map#top');
  });

  it('rejects targets on other hosts', () => {
    for (const value of ['//evil.example', '/\\evil.example', '/\\/evil.example', '/\t/evil.example', 'https://evil.example', 'evil.example', '', undefined, ['/']]) {
      expect(safeRedirectPath(value)).toBeUndefined();
    }
  });
});

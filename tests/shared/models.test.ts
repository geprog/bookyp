import { describe, expect, it } from 'vitest';
import { isDomainInvitation } from '../../shared/types/models';

describe('isDomainInvitation', () => {
  it('recognizes domain invitations', () => {
    expect(isDomainInvitation({ email: '@example.com' })).toBe(true);
    expect(isDomainInvitation({ email: 'alice@example.com' })).toBe(false);
  });
});

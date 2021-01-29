import { version, validate } from 'uuid';

import AbstractEntity from '@/model/AbstractEntity';

class TestEntity extends AbstractEntity {}

describe('Common behavior of AbstractEntity', () => {
  it('a new AbstractEntitiy shall have auto generated uuidv4', () => {
    const testEntity = new TestEntity();
    expect(testEntity.id).toBeDefined();
    expect(validate(testEntity.id)).toBeTruthy();
    expect(version(testEntity.id)).toBe(4);
  });
});

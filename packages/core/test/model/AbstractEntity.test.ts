import { version, validate } from 'uuid';

import AbstractEntity from '@/model/AbstractEntity';

describe('Common behavior of AbstractEntity', () => {
  it('a new AbstractEntity shall have auto generated uuidv4', () => {
    // given
    class TestEntity extends AbstractEntity {}
    // when
    const testEntity = new TestEntity();
    // then
    expect(testEntity.id).toBeDefined();
    expect(validate(testEntity.id)).toBeTruthy();
    expect(version(testEntity.id)).toBe(4);
  });
});

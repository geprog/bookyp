import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import removeImageUrlFromData from '~/services/spaces/hooks/removeImageUrlFromData';

type Context = HookContext<Application, AdapterService<Model.Space>>;

describe('removeImageUrlFromData hook', () => {
  it('should drop the signed url but keep the key', () => {
    expect.assertions(1);
    // given
    const context = { data: { imageKey: 'space-1/a.png', imageUrl: 'https://signed/space-1/a.png' } } as Context;

    // when
    removeImageUrlFromData(context);

    // then
    expect(context.data).toStrictEqual({ imageKey: 'space-1/a.png' });
  });

  it('should handle multiple spaces', () => {
    expect.assertions(1);
    // given
    const context = { data: [{ imageUrl: 'https://signed/a' }, { name: 'Space' }] } as unknown as Context;

    // when
    removeImageUrlFromData(context);

    // then
    expect(context.data).toStrictEqual([{}, { name: 'Space' }]);
  });

  it('should do nothing without data', () => {
    expect.assertions(1);
    // given
    const context = { data: undefined } as Context;

    // when
    removeImageUrlFromData(context);

    // then
    expect(context.data).toBeUndefined();
  });
});

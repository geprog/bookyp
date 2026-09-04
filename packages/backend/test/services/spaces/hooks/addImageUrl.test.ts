import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { getDownloadUrl } from '~/lib/fileUrls';
import addImageUrl from '~/services/spaces/hooks/addImageUrl';
import { prepareAppMock } from '$/__helpers__/mocks';

vi.mock('~/lib/fileUrls');

type Context = HookContext<Application, AdapterService<Model.Space>>;

function prepareContext(result: unknown): Context {
  return { app: prepareAppMock() as unknown as Application, result } as Context;
}

describe('addImageUrl hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getDownloadUrl).mockImplementation((_app, key) => Promise.resolve(`https://signed/${key}`));
  });

  it('should add a signed url for a single space', async () => {
    expect.assertions(1);
    // given
    const context = prepareContext({ name: 'Space', imageKey: 'space-1/image.png' });

    // when
    await addImageUrl(context);

    // then
    expect(context.result).toStrictEqual({
      name: 'Space',
      imageKey: 'space-1/image.png',
      imageUrl: 'https://signed/space-1/image.png',
    });
  });

  it('should add a signed url for every space with an image', async () => {
    expect.assertions(2);
    // given
    const context = prepareContext([{ imageKey: 'space-1/a.png' }, { name: 'without image' }]);

    // when
    await addImageUrl(context);

    // then
    expect(context.result).toStrictEqual([
      { imageKey: 'space-1/a.png', imageUrl: 'https://signed/space-1/a.png' },
      { name: 'without image' },
    ]);
    expect(getDownloadUrl).toHaveBeenCalledTimes(1);
  });

  it('should do nothing without a result', async () => {
    expect.assertions(1);
    // given
    const context = prepareContext(undefined);

    // when
    await addImageUrl(context);

    // then
    expect(getDownloadUrl).not.toHaveBeenCalled();
  });
});

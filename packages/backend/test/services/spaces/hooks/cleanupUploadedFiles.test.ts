import { Application, Service } from '@bookyp/core';
import { HookContext } from '@feathersjs/feathers';
import { Client } from 'minio';
import { Readable } from 'stream';

import getConfig from '~/config';
import { cleanupUploadedFiles } from '~/services/spaces/hooks/cleanupUploadedFiles';
import { sampleConfig } from '$/__helpers__/mocks';

vi.mock('~/config');

type Context = HookContext<Application, Service.ServiceTypes['spaces']>;

const objects = [{ name: 'space-1/keep.png' }, { name: 'space-1/orphan.png' }];

function prepareContext(data: unknown, type = 'after') {
  const removeObject = vi.fn().mockResolvedValue(undefined);
  const listObjectsV2 = vi.fn().mockImplementation(() => Readable.from(objects, { objectMode: true }));
  const s3 = { listObjectsV2, removeObject } as unknown as Client;

  const context = {
    type,
    method: 'patch',
    data,
    app: { get: vi.fn().mockReturnValue(s3) } as unknown as Application,
  } as Context;

  return { context, listObjectsV2, removeObject };
}

describe('cleanupUploadedFiles hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getConfig).mockReturnValue(sampleConfig);
  });

  it('should only remove files that are not referenced anymore', async () => {
    expect.assertions(3);
    // given
    const { context, listObjectsV2, removeObject } = prepareContext({
      _id: 'space-1',
      imageKey: 'space-1/keep.png',
    });

    // when
    await cleanupUploadedFiles(context);

    // then
    expect(listObjectsV2).toHaveBeenCalledWith(sampleConfig.s3.bucket, 'space-1/', true);
    expect(removeObject).toHaveBeenCalledTimes(1);
    expect(removeObject).toHaveBeenCalledWith(sampleConfig.s3.bucket, 'space-1/orphan.png');
  });

  it('should remove all files once the image has been cleared', async () => {
    expect.assertions(1);
    // given
    const { context, removeObject } = prepareContext({ _id: 'space-1', imageKey: '' });

    // when
    await cleanupUploadedFiles(context);

    // then
    expect(removeObject).toHaveBeenCalledTimes(2);
  });

  it('should not remove anything when the update does not touch the image', async () => {
    expect.assertions(2);
    // given
    const { context, listObjectsV2, removeObject } = prepareContext({ _id: 'space-1', name: 'New name' });

    // when
    await cleanupUploadedFiles(context);

    // then
    expect(listObjectsV2).not.toHaveBeenCalled();
    expect(removeObject).not.toHaveBeenCalled();
  });

  it('should throw when used as a before hook', async () => {
    expect.assertions(1);
    // given
    const { context } = prepareContext({ _id: 'space-1', imageKey: '' }, 'before');

    // then
    await expect(cleanupUploadedFiles(context)).rejects.toThrow(
      "The 'cleanupUploadedFiles' hook should only be used as an 'after' hook.",
    );
  });
});

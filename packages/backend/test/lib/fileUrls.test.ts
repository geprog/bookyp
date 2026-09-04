import { Application } from '@bookyp/core';

import getConfig from '~/config';
import { getDownloadUrl } from '~/lib/fileUrls';
import { sampleConfig } from '$/__helpers__/mocks';

vi.mock('~/config');

const key = 'space-1/abc-image.png';

function prepareApp() {
  const presignedGetObject = vi.fn().mockResolvedValue('https://s3.example.geprog.com/signed');
  const app = { get: vi.fn().mockReturnValue({ presignedGetObject }) } as unknown as Application;
  vi.mocked(getConfig).mockReturnValue(sampleConfig);
  return { app, presignedGetObject };
}

describe('getDownloadUrl', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should sign the object for twice the configured window', async () => {
    expect.assertions(1);
    // given
    const { app, presignedGetObject } = prepareApp();
    vi.setSystemTime(new Date('2026-09-03T10:05:00.000Z'));

    // when
    await getDownloadUrl(app, key);

    // then
    expect(presignedGetObject).toHaveBeenCalledWith(
      sampleConfig.s3.bucket,
      key,
      sampleConfig.s3.downloadUrlWindow * 2,
      {
        'response-content-disposition': 'inline',
        'response-cache-control': `private, max-age=${sampleConfig.s3.downloadUrlWindow}`,
      },
      new Date('2026-09-03T10:00:00.000Z'),
    );
  });

  it('should pin the signing timestamp within the same window', async () => {
    expect.assertions(1);
    // given
    const { app, presignedGetObject } = prepareApp();

    // when
    vi.setSystemTime(new Date('2026-09-03T10:05:00.000Z'));
    await getDownloadUrl(app, key);
    vi.setSystemTime(new Date('2026-09-03T10:59:59.000Z'));
    await getDownloadUrl(app, key);

    // then
    const [first, second] = presignedGetObject.mock.calls;
    expect(first).toStrictEqual(second);
  });

  it('should move the signing timestamp to the next window', async () => {
    expect.assertions(2);
    // given
    const { app, presignedGetObject } = prepareApp();

    // when
    vi.setSystemTime(new Date('2026-09-03T10:59:59.000Z'));
    await getDownloadUrl(app, key);
    vi.setSystemTime(new Date('2026-09-03T11:00:01.000Z'));
    await getDownloadUrl(app, key);

    // then
    expect(presignedGetObject.mock.calls[0]?.[4]).toStrictEqual(new Date('2026-09-03T10:00:00.000Z'));
    expect(presignedGetObject.mock.calls[1]?.[4]).toStrictEqual(new Date('2026-09-03T11:00:00.000Z'));
  });
});

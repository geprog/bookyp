import feathers from '@feathersjs/feathers';

import { createApplication } from '~/application';

vi.mock('@feathersjs/feathers');

describe('Application', () => {
  it('shall create an application', () => {
    expect.assertions(1);
    // when
    createApplication();

    // then
    expect(feathers).toHaveBeenCalledTimes(1);
  });
});

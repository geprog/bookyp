describe('Application', () => {
  it('shall create an application', async () => {
    // given
    jest.mock('@feathersjs/feathers');
    const feathers = await import('@feathersjs/feathers');
    const application = await import('~/application');

    // when
    application.createApplication();

    // then
    expect(feathers).toBeCalledTimes(1);
  });
});

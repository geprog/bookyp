import Icons from '~/assets/icons';

describe('Icons', () => {
  it('should contain all needed icons', () => {
    // given

    // when

    // then
    expect(Object.keys(Icons)).toMatchSnapshot();
  });
});

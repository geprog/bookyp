const t = jest.fn();
// eslint-disable-next-line jest/require-hook
t.mockReturnValue('Mock translation');

function useI18n() {
  return { t };
}

module.exports = { useI18n };

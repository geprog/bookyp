const t = jest.fn();
t.mockReturnValue('Mock translation');

function useI18n() {
  return { t };
}

module.exports = { useI18n };

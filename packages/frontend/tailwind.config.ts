import colors from 'windicss/colors';
import typography from 'windicss/plugin/typography';

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: colors.teal,
      },
      boxShadow: {
        full: '0px 0px 4.8px rgb(0, 0, 0, 0.1), 0px 0px 20.8px rgb(0, 0, 0, 0.13)',
      },
    },
  },
  plugins: [typography],
};

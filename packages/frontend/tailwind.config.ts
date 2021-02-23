import colors from 'windicss/colors';
import typography from 'windicss/plugin/typography';

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: colors.teal,
      },
    },
  },
  plugins: [typography],
};

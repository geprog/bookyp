import colors from 'windicss/colors';
import typography from 'windicss/plugin/typography';

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: colors.teal,
        primary: {
          normal: '#F59E0B',
          dark: '#D97706',
          light: '#FDE68A',
        },
        gray: {
          active: '#111827',
          active_second: '#6B7280',
          inactive: '#9CA3AF',
          background: '#E5E7EB',
        },
        green: {
          text: '#059669',
          background: '#A7F3D0',
        },
        red: {
          text: '#DC2626',
          background: '#FECACA',
        },
        blue: {
          text: '#2563EB',
          background: '#BFDBFE',
        },
        white: '#FFFFFF',
      },
      boxShadow: {
        full: '0px 0px 4.8px rgb(0, 0, 0, 0.1), 0px 0px 20.8px rgb(0, 0, 0, 0.13)',
      },
    },
  },
  plugins: [typography],
};

import colors from 'windicss/colors';
import { defineConfig } from 'windicss/helpers';
import plugin from 'windicss/plugin';
import typography from 'windicss/plugin/typography';

export default defineConfig({
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    stroke: (theme) => theme('colors'),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    fill: (theme) => theme('colors'),
  },
  plugins: [
    typography,
    plugin(({ addUtilities }) => {
      const newUtilities = {
        // necessary for proper svg rotation transformation
        '.transform-box-fill': {
          'transform-box': 'fill-box',
        },
        // necessary to track touch events with pointer api
        '.touch-none': {
          'touch-action': 'none',
        },
      };
      addUtilities(newUtilities);
    }),
  ],
});

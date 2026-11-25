export default defineAppConfig({
  ui: {
    colors: {
      primary: 'amber',
      neutral: 'gray',
    },
    button: {
      defaultVariants: {
        size: 'md',
      },
      slots: {
        base: 'font-bold',
      },
    },
    card: {
      slots: {
        root: 'shadow-full ring-0',
        body: 'p-3 sm:p-4',
      },
    },
  },
});

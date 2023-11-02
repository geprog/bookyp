import { ref } from 'vue';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useCurrentTime() {
  const currentTime = ref(new Date());
  setInterval(() => {
    currentTime.value = new Date();
  }, 1000 * 60);

  return { currentTime };
}

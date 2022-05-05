import { ref } from 'vue';

type Capture = { target: Element; pointerId: number };

type UsePointerCapturing = {
  setCapture: (event: PointerEvent) => void;
  releaseCapture: () => void;
};

export default function usePointerCapturing(): UsePointerCapturing {
  const currentCapture = ref<Capture>();

  function setCapture(event: PointerEvent) {
    if (currentCapture.value === undefined && event.target !== null) {
      currentCapture.value = {
        target: event.target as Element,
        pointerId: event.pointerId,
      };
      (event.target as Element).setPointerCapture(event.pointerId);
    }
  }

  function releaseCapture() {
    if (currentCapture.value !== undefined) {
      currentCapture.value.target.releasePointerCapture(currentCapture.value.pointerId);
      currentCapture.value = undefined;
    }
  }

  return {
    setCapture,
    releaseCapture,
  };
}

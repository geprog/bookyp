import { Ref, ref } from 'vue';

type UseNewFloorPlanObject = {
  startAddingWall: () => void;
  addFirstPositionOfWall: (svgP: DOMPoint) => void;
  finishAddingOfWall: () => void;
  updateSecondPositionOfWall: (svgP: DOMPoint) => void;
  addingStage: Ref<'clicked-on-add-button' | 'first-position' | 'not-started'>;
};

export default function useNewFloorPlanObject(floorPlan: Ref<string[]>): UseNewFloorPlanObject {
  const addingStage = ref<'clicked-on-add-button' | 'first-position' | 'not-started'>('not-started');
  let firstPosition: null | DOMPoint = null;

  function startAddingWall() {
    addingStage.value = 'clicked-on-add-button';
  }

  function addFirstPositionOfWall(svgP: DOMPoint) {
    if (addingStage.value === 'clicked-on-add-button') {
      /* istanbul ignore next */
      if (!svgP) {
        throw new Error('Unexpected: svg point should have been provided');
      }
      firstPosition = svgP;
      addingStage.value = 'first-position';
      floorPlan.value.push(`M${firstPosition.x} ${firstPosition.y} L${svgP.x} ${svgP.y}`);
    }
  }

  function finishAddingOfWall() {
    if (
      addingStage.value === 'first-position' &&
      firstPosition !== null &&
      floorPlan.value[floorPlan.value.length - 1] !==
        `M${firstPosition.x} ${firstPosition.y} L${firstPosition.x} ${firstPosition.y}`
    ) {
      // reset stage
      firstPosition = null;
      addingStage.value = 'not-started';
    }
  }

  function updateSecondPositionOfWall(svgP: DOMPoint) {
    if (firstPosition !== null) {
      floorPlan.value[floorPlan.value.length - 1] = `M${firstPosition.x} ${firstPosition.y} L${svgP.x} ${svgP.y}`;
    }
  }

  return {
    startAddingWall,
    addFirstPositionOfWall,
    finishAddingOfWall,
    updateSecondPositionOfWall,
    addingStage,
  };
}

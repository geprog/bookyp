import { Ref, ref } from 'vue';

import getCurrentSpace from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

type UseNewFloorPlanObject = {
  saveNewFloorPlanObjects: () => Promise<void>;
  startAddingWall: () => void;
  addFirstPositionOfWall: (svgP: DOMPoint) => void;
  finishAddingOfWall: (svgP: DOMPoint) => void;
  updateSecondPositionOfWall: (svgP: DOMPoint) => void;
  newFloorPlanObjects: Ref<string[]>;
  addingStage: Ref<'clicked-on-add-button' | 'first-position' | 'not-started'>;
};

export default function useNewFloorPlanObject(): UseNewFloorPlanObject {
  const newFloorPlanObjects = ref<string[]>([]);
  const { data: currentSpace } = getCurrentSpace();
  const feathers = useFeathers();
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
      newFloorPlanObjects.value.push(`M${firstPosition?.x} ${firstPosition?.y} L${svgP.x} ${svgP.y}`);
    }
  }

  function finishAddingOfWall(svgP: DOMPoint) {
    if (
      addingStage.value === 'first-position' &&
      firstPosition !== null &&
      svgP.x !== firstPosition.x &&
      svgP.y !== firstPosition.y
    ) {
      // reset stage
      firstPosition = null;
      addingStage.value = 'not-started';
    }
  }

  function updateSecondPositionOfWall(svgP: DOMPoint) {
    if (firstPosition !== null) {
      newFloorPlanObjects.value[
        newFloorPlanObjects.value.length - 1
      ] = `M${firstPosition?.x} ${firstPosition?.y} L${svgP.x} ${svgP.y}`;
    }
  }

  async function saveNewFloorPlanObjects(): Promise<void> {
    if (newFloorPlanObjects.value.length >= 1 && currentSpace.value !== undefined) {
      const saveSpace = {
        _id: currentSpace.value._id,
        floorPlan: [...newFloorPlanObjects.value, ...currentSpace.value.floorPlan],
      };
      await feathers.service('spaces').update(currentSpace.value._id, saveSpace);
      newFloorPlanObjects.value = [];
    }
  }

  return {
    saveNewFloorPlanObjects,
    startAddingWall,
    addFirstPositionOfWall,
    finishAddingOfWall,
    updateSecondPositionOfWall,
    addingStage,
    newFloorPlanObjects,
  };
}

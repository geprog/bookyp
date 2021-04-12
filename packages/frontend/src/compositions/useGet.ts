import { Model, Service } from '@bookyp/core';
import { Id, Service as FeathersService } from '@feathersjs/feathers';
import { onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';

import useFeathers from './useFeathers';

function loadServiceEventHandlers<T extends Model.AbstractEntity>(
  service: FeathersService<T>,
  _id: Ref<Id>,
  data: Ref<T | undefined>,
): () => void {
  const onCreated = (item: T): void => {
    if (_id.value === item._id) {
      data.value = item;
    }
  };

  const onRemoved = (item: T): void => {
    if (_id.value === item._id) {
      data.value = undefined;
    }
  };

  const onItemChanged = (item: T): void => {
    if (_id.value === item._id) {
      data.value = item;
    }
  };

  service.on('created', onCreated);
  service.on('removed', onRemoved);
  service.on('patched', onItemChanged);
  service.on('updated', onItemChanged);

  const unloadEventHandlers = () => {
    service.off('created', onCreated);
    service.off('removed', onRemoved);
    service.off('patched', onItemChanged);
    service.off('updated', onItemChanged);
  };

  return unloadEventHandlers;
}

export type UseGet<T extends Model.AbstractEntity> = {
  data: Ref<T | undefined>;
  isLoading: Ref<boolean>;
};

export default <T extends keyof Service.ServiceModels>(
  serviceName: T,
  _id: Ref<Id>,
): UseGet<Service.ServiceModels[T]> => {
  type M = Service.ServiceModels[T];

  const feathers = useFeathers();

  const data = ref<M>();
  const isLoading = ref(false);

  const service = feathers.service(serviceName) as FeathersService<M>;
  const unloadEventHandlers = loadServiceEventHandlers<M>(service, _id, data);

  const get = async () => {
    isLoading.value = true;
    data.value = await service.get(_id.value);
    isLoading.value = false;
  };

  onMounted(async () => {
    await get();
  });

  feathers.on('connect', () => {
    void get();
  });

  watch(_id, async () => {
    await get();
  });

  onBeforeUnmount(() => {
    unloadEventHandlers();
  });

  return { isLoading, data };
};

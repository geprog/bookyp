import { Model, Service } from '@bookyp/core';
import { Service as FeathersService } from '@feathersjs/feathers';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';

import useFeathers from './useFeathers';

function loadServiceEventHandlers<T extends Model.AbstractEntity>(
  service: FeathersService<T>,
  data: Ref<T[]>,
): () => void {
  const onCreated = (item: T): void => {
    data.value = [...data.value, item];
  };

  const onRemoved = (item: T): void => {
    data.value = data.value.filter((_item) => _item._id !== item._id);
  };

  const onItemChanged = (changedItem: T): void => {
    data.value = data.value.map((item) => {
      if (item._id === changedItem._id) {
        return changedItem;
      }

      return item;
    });
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

export type UseFind<T extends Model.AbstractEntity> = {
  data: Ref<T[]>;
  isLoading: Ref<boolean>;
};

export default <T extends keyof Service.ServiceModels>(serviceName: T): UseFind<Service.ServiceModels[T]> => {
  type M = Service.ServiceModels[T];

  const feathers = useFeathers();

  // type cast is fine here (source: https://github.com/vuejs/vue-next/issues/2136#issuecomment-693524663)
  const data = ref<M[]>([]) as Ref<M[]>;
  const isLoading = ref(false);

  const service = feathers.service(serviceName) as FeathersService<M>;
  const unloadEventHandlers = loadServiceEventHandlers<M>(service, data);

  const find = async () => {
    isLoading.value = true;
    const res = await service.find({ paginate: false });
    data.value = Array.isArray(res) ? res : [res];
    isLoading.value = false;
  };

  const connectListener = () => {
    void find();
  };

  feathers.on('connect', connectListener);

  onMounted(async () => {
    await find();
  });

  onBeforeUnmount(() => {
    unloadEventHandlers();
    feathers.off('connect', connectListener);
  });

  return { data, isLoading };
};

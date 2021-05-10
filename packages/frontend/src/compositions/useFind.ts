import { FeathersService, ServiceMethods } from '@feathersjs/feathers';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';

import useFeathers, { ClientApplication, getId, ServiceModel, ServiceTypes } from './useFeathers';

function loadServiceEventHandlers<T extends keyof ServiceTypes, M>(
  service: FeathersService<ClientApplication, ServiceTypes[T]>,
  data: Ref<M[]>,
): () => void {
  const onCreated = (item: M): void => {
    data.value = [...data.value, item];
  };

  const onRemoved = (item: M): void => {
    data.value = data.value.filter((_item) => getId(_item) !== getId(item));
  };

  const onItemChanged = (changedItem: M): void => {
    data.value = data.value.map((item) => {
      if (getId(item) === getId(changedItem)) {
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

export type UseFind<T> = {
  data: Ref<T[]>;
  isLoading: Ref<boolean>;
};

export default <T extends keyof ServiceTypes, M = ServiceModel<T>>(serviceName: T): UseFind<M> => {
  const feathers = useFeathers();

  // type cast is fine here (source: https://github.com/vuejs/vue-next/issues/2136#issuecomment-693524663)
  const data = ref<M[]>([]) as Ref<M[]>;
  const isLoading = ref(false);

  const service = feathers.service(serviceName);
  const unloadEventHandlers = loadServiceEventHandlers(service, data);

  const find = async () => {
    isLoading.value = true;
    // TODO: the typecast below is necessary due to the prerelease state of feathers v5. The problem there is
    // that the AdapterService interface is not yet updated and is not compatible with the ServiceMethods interface.
    const res = await ((service as unknown) as ServiceMethods<M>).find({ paginate: false });
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

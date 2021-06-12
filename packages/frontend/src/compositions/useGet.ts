import { FeathersService, Id, ServiceMethods } from '@feathersjs/feathers';
import { onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';

import useFeathers, { ClientApplication, getId, ServiceModel, ServiceTypes } from './useFeathers';

function loadServiceEventHandlers<T extends keyof ServiceTypes, M>(
  service: FeathersService<ClientApplication, ServiceTypes[T]>,
  _id: Ref<Id | undefined>,
  data: Ref<M | undefined>,
): () => void {
  const onCreated = (item: M): void => {
    if (_id.value === getId(item)) {
      data.value = item;
    }
  };

  const onRemoved = (item: M): void => {
    if (_id.value === getId(item)) {
      data.value = undefined;
    }
  };

  const onItemChanged = (item: M): void => {
    if (_id.value === getId(item)) {
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

export type UseGet<T> = {
  data: Ref<T | undefined>;
  isLoading: Ref<boolean>;
};

export default <T extends keyof ServiceTypes, M = ServiceModel<T>>(
  serviceName: T,
  _id: Ref<Id | undefined>,
): UseGet<M> => {
  const feathers = useFeathers();

  const data = ref<M>();
  const isLoading = ref(false);

  const service = feathers.service(serviceName);

  const unloadEventHandlers = loadServiceEventHandlers(service, _id, data);

  const get = async () => {
    isLoading.value = true;
    if (!_id.value) {
      data.value = undefined;
      return;
    }
    // TODO: the typecast below is necessary due to the prerelease state of feathers v5. The problem there is
    // that the AdapterService interface is not yet updated and is not compatible with the ServiceMethods interface.
    data.value = await (service as unknown as ServiceMethods<M>).get(_id.value);
    isLoading.value = false;
  };

  watch(_id, async () => {
    await get();
  });

  const connectListener = () => {
    void get();
  };

  feathers.on('connect', connectListener);

  onMounted(async () => {
    await get();
  });

  onBeforeUnmount(() => {
    unloadEventHandlers();
    feathers.off('connect', connectListener);
  });

  return { isLoading, data };
};

import AbstractEntity from '~/model/AbstractEntity';

type Ref<T extends AbstractEntity> = T['_id'];
export default Ref;

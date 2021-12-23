export default abstract class AbstractEntity {
  readonly _id!: string;
  deleted?: boolean;
}

export type Ref<T extends AbstractEntity> = T['_id'];

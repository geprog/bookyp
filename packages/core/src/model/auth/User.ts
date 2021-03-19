import AbstractEntity from '~/model/AbstractEntity';

export default class User extends AbstractEntity {
  name?: string;
  email!: string;
}

import { AbstractEntity, Ref } from '~/model/AbstractEntity';
import { Space } from '~/model/Space';
import { User } from '~/model/User';

export class Invitation extends AbstractEntity {
  role!: Space['members'][0]['role'];
  email!: User['email'];
  rejectedBy: Ref<User>[] = [];
  spaceId!: Ref<Space>;
  spaceName!: Space['name'];

  constructor(data: Partial<Invitation> = {}) {
    super();
    Object.assign(this, data);
  }

  static isDomainInvitation(invitation: Invitation): boolean {
    return invitation.email.startsWith('@');
  }
}

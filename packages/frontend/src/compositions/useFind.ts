import { useFind } from '@geprog/use-feathers';

import useFeathers, { ClientApplication } from '~/compositions/useFeathers';

export default useFind<ClientApplication>(useFeathers());

import { useGet } from '@geprog/use-feathers';

import useFeathers, { ClientApplication } from '~/compositions/useFeathers';

export default useGet<ClientApplication>(useFeathers());

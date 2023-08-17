import { Blueprint } from '../types/classes/PTypes.interface';
import { AuthType } from '../types/enums/Admin.enum';

export const StructureBlueprint: Blueprint[] = [
  {
    name: 'if',
    hover: 'if statement flow control',
    auth: AuthType.none,
    get: () => undefined,
    set: () => undefined,
  },
];

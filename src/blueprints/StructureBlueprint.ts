import { Blueprint } from '../types/classes/PTypes.interface';
import { AuthType } from '../types/enums/Admin.enum';

export const StructureBlueprint: Blueprint[] = [
  {
    name: 'if',
    hover: 'if statement flow control',
    get: null,
    set: null,
    auth: AuthType.none,
  },
];

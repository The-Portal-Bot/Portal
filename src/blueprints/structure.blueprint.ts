import { Blueprint } from '../types/classes/PTypes.interface.js';
import { AuthType } from '../types/enums/Admin.enum.js';

export const StructureBlueprint: Blueprint[] = [
  {
    name: 'if',
    hover: 'if statement flow control',
    auth: AuthType.none,
    get: () => undefined,
    set: () => undefined,
  },
];

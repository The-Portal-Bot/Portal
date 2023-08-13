import { InterfaceBlueprint } from '../classes/PTypes.interface';
import { AuthType } from '../enums/Admin.enum';

export const STRUCTURE_PREFIX = '{{';

export const StructureBlueprint: InterfaceBlueprint[] = [
  {
    name: 'if',
    hover: 'if statement flow control',
    get: null,
    set: null,
    auth: AuthType.none,
  },
];

export function isStructure(candidate: string): string {
  for (let i = 0; i < StructureBlueprint.length; i++) {
    const subString = String(candidate).substring(1, String(StructureBlueprint[i].name).length + 1);

    if (subString == StructureBlueprint[i].name) {
      return StructureBlueprint[i].name;
    }
  }

  return '';
}

import { StructureBlueprint } from '../blueprints/structure.blueprint.js';

export function isStructure(candidate: string): string {
  for (let i = 0; i < StructureBlueprint.length; i++) {
    const subString = String(candidate).substring(1, String(StructureBlueprint[i].name).length + 1);

    if (subString == StructureBlueprint[i].name) {
      return StructureBlueprint[i].name;
    }
  }

  return '';
}

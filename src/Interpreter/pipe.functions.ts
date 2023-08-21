import { PipeBlueprints } from '../blueprints/pipe.blueprint';

export function isPipe(candidate: string): string {
  for (let i = 0; i < PipeBlueprints.length; i++) {
    const subString = String(candidate).substring(1, String(PipeBlueprints[i].name).length + 1);

    if (subString == PipeBlueprints[i].name) {
      return PipeBlueprints[i].name;
    }
  }

  return '';
}

export function getPipe(string: string | string[], pipe: string): string | number {
  for (let l = 0; l < PipeBlueprints.length; l++) {
    if (pipe === PipeBlueprints[l].name) {
      return PipeBlueprints[l].get({ string }) as string | number;
    }
  }

  return -1;
}

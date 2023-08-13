import { VoiceChannel, Guild } from 'discord.js';
import { VariableBlueprints } from '../blueprints/VariableBlueprint';
import { PGuild } from '../types/classes/PGuild.class';
import { PChannel } from '../types/classes/PPortalChannel.class';
import { PVoiceChannel } from '../types/classes/PVoiceChannel.class';

export function isVariable(candidate: string): string {
  for (let i = 0; i < VariableBlueprints.length; i++) {
    const subString = String(candidate).substring(1, String(VariableBlueprints[i].name).length + 1);

    if (subString === VariableBlueprints[i].name) {
      return VariableBlueprints[i].name;
    }
  }

  return '';
}

export function getVariable(
  voiceChannel: VoiceChannel | undefined | null,
  pVoiceChannel: PVoiceChannel | undefined | null,
  pChannels: PChannel[] | undefined | null,
  pGuild: PGuild,
  guild: Guild,
  variable: string
) {
  let variableIndex = -1;
  for (let l = 0; l < VariableBlueprints.length; l++) {
    if (variable === VariableBlueprints[l].name) {
      variableIndex = l;
      break;
    }
  }

  if (variableIndex === -1) {
    return -1;
  }

  return VariableBlueprints[variableIndex].get(voiceChannel, pVoiceChannel, pChannels, pGuild, guild);
}

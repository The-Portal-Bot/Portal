import { VoiceChannel, Guild } from 'discord.js';

import { VariableBlueprints } from '../blueprints/variable.blueprint.js';
import { PGuild } from '../types/classes/PGuild.class.js';
import { PChannel } from '../types/classes/PPortalChannel.class.js';
import { PVoiceChannel } from '../types/classes/PVoiceChannel.class.js';

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
  voiceChannel: VoiceChannel,
  pVoiceChannel: PVoiceChannel | null,
  pChannels: PChannel[],
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

  return VariableBlueprints[variableIndex].get({
    voiceChannel,
    pVoiceChannel,
    pChannels,
    pGuild,
    guild
  });
}

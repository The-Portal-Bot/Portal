import { ChatInputCommandInteraction, Client } from 'discord.js';
import * as authCommands from '../commands/auth';
import * as noAuthCommands from '../commands/noAuth';
import { logger, pad, getElapsedTime } from '../libraries/help.library';
import { PGuild } from '../types/classes/PGuild.class';
import {
  ActiveCooldowns,
  AuthCommands,
  CommandOptions,
  NoAuthCommands,
  ScopeLimit
} from '../types/classes/PTypes.interface';

const commandMap = {
  about: noAuthCommands.about,
  announce: noAuthCommands.announce,
  bet: noAuthCommands.bet,
  corona: noAuthCommands.corona,
  crypto: noAuthCommands.crypto,
  focus: noAuthCommands.focus,
  football: noAuthCommands.football,
  help: noAuthCommands.help,
  join: noAuthCommands.join,
  leaderboard: noAuthCommands.leaderboard,
  leave: noAuthCommands.leave,
  level: noAuthCommands.level,
  ping: noAuthCommands.ping,
  poll: noAuthCommands.poll,
  ranks: noAuthCommands.ranks,
  roll: noAuthCommands.roll,
  run: noAuthCommands.run,
  state: noAuthCommands.state,
  spam_rules: noAuthCommands.spam_rules,
  weather: noAuthCommands.weather,
  whoami: noAuthCommands.whoami,
  announcement: authCommands.announcement,
  ban: authCommands.ban,
  delete_messages: authCommands.delete_messages,
  force: authCommands.force,
  ignore: authCommands.ignore,
  invite: authCommands.invite,
  kick: authCommands.kick,
  music: authCommands.music,
  portal: authCommands.portal,
  vendor: authCommands.vendor,
  set_ranks: authCommands.set_ranks,
  set: authCommands.set,
  url: authCommands.url
};

export async function commandLoader(
  interaction: ChatInputCommandInteraction,
  command: AuthCommands | NoAuthCommands,
  args: string[],
  pGuild: PGuild,
  client: Client,
  scopeLimit: ScopeLimit,
  time: number,
  activeCooldowns: ActiveCooldowns
) {
  if (scopeLimit === 'none' && time === 0) {
    return await commandExecution(interaction, command, args, pGuild, client);
  }

  const cooldown = hasActiveCooldown(interaction, command, scopeLimit, activeCooldowns);

  if (cooldown) {
    logger.info(`User ${interaction.user.id} tried to use ${command} but is on cooldown`);

    const elapsedTime = getElapsedTime(cooldown.timestamp, time);

    return {
      result: false,
      value: `you need to wait **${pad(elapsedTime.remainingMin)}:` +
        `${pad(elapsedTime.remainingSec)}/${pad(elapsedTime.timeoutMin)}:` +
        `${pad(elapsedTime.timeoutSec)}** *to use* **${command}** *again` +
        scopeLimit !== ScopeLimit.MEMBER ? `, as it was used again in* **${interaction.guild?.name}**` : '.*',
    }
  }

  const commandReturn = await commandExecution(interaction, command, args, pGuild, client);

  if (commandReturn.result && interaction.guild) {
    const activeCooldown = scopeLimit === ScopeLimit.GUILD ? activeCooldowns['guild'] : activeCooldowns['member'];

    activeCooldown.push({
      member: interaction.user.id,
      guild: interaction.guild.id,
      command: command,
      timestamp: Date.now(),
    });

    if (time) {
      setTimeout(() => {
        const updatedCooldown = activeCooldown.filter((active) => active.command !== command);
        if (scopeLimit === ScopeLimit.GUILD) {
          activeCooldowns['guild'] = updatedCooldown;
        } else {
          activeCooldowns['member'] = updatedCooldown;
        }
      }, time * 60 * 1000);
    }
  }

  return commandReturn;
}

export function commandResolver(command: AuthCommands | NoAuthCommands) {
  const commandFile = commandMap[command];

  if (!commandFile) {
    throw Error(`command ${command} not found`);
  }

  return commandFile;
}

function hasActiveCooldown(
  interaction: ChatInputCommandInteraction,
  command: AuthCommands | NoAuthCommands,
  scopeLimit: Omit<ScopeLimit, ScopeLimit.NONE>,
  activeCooldowns: ActiveCooldowns
) {
  const activeCooldown = scopeLimit === ScopeLimit.GUILD ? activeCooldowns['guild'] : activeCooldowns['member'];

  return activeCooldown.find((activeCurrent) => {
    if (activeCurrent.command === command) {
      if (scopeLimit === ScopeLimit.MEMBER && activeCurrent.member === interaction?.user.id) {
        if (interaction.guild && activeCurrent.guild === interaction.guild.id) {
          return true;
        }
      }

      if (scopeLimit === ScopeLimit.GUILD) {
        if (interaction.guild && activeCurrent.guild === interaction.guild.id) {
          return true;
        }
      }
    }

    return false;
  });
}

async function commandExecution(
  interaction: ChatInputCommandInteraction,
  command: AuthCommands | NoAuthCommands,
  args: string[],
  pGuild: PGuild,
  client: Client
) {
  try {
    return await commandResolver(command).execute(interaction, pGuild, client);
  } catch (e) {
    logger.error(new Error(`While executing ${command}, got error: ${e}`));
    return {
      result: false,
      value: `While executing ${command}, got error: ${e}`,
    }
  }
}

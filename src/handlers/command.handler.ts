// import eventConfigJson from '../config.event.json';
import { ChatInputCommandInteraction, Client, Message } from 'discord.js';
import { logger, messageReply, pad, timeElapsed } from '../libraries/help.library';
import { PGuild } from '../types/classes/PGuild.class';
import {
  CommandOptions,
  ReturnPromise,
  AuthCommands,
  NoAuthCommands,
  ScopeLimit,
  ActiveCooldowns,
  ActiveCooldown,
} from '../types/classes/PTypes.interface';
import about from '../commands/noAuth/about';
import ai from '../commands/noAuth/ai';
import announce from '../commands/noAuth/announce';
import bet from '../commands/noAuth/bet';
import corona from '../commands/noAuth/corona';
import crypto from '../commands/noAuth/crypto';
import focus from '../commands/noAuth/focus';
import football from '../commands/noAuth/football';
import help from '../commands/noAuth/help';
import join from '../commands/noAuth/join';
import joke from '../commands/noAuth/joke';
import leaderboard from '../commands/noAuth/leaderboard';
import leave from '../commands/noAuth/leave';
import level from '../commands/noAuth/level';
import news from '../commands/noAuth/news';
import ping from '../commands/noAuth/ping';
import poll from '../commands/noAuth/poll';
import ranks from '../commands/noAuth/ranks';
import roll from '../commands/noAuth/roll';
import run from '../commands/noAuth/run';
import state from '../commands/noAuth/state';
import spam_rules from '../commands/noAuth/spam_rules';
import weather from '../commands/noAuth/weather';
import whoami from '../commands/noAuth/whoami';
import announcement from '../commands/auth/announcement';
import ban from '../commands/auth/ban';
import delete_messages from '../commands/auth/delete_messages';
import force from '../commands/auth/force';
import ignore from '../commands/auth/ignore';
import invite from '../commands/auth/invite';
import kick from '../commands/auth/kick';
import music from '../commands/auth/music';
import portal from '../commands/auth/portal';
import vendor from '../commands/auth/vendor';
import set_ranks from '../commands/auth/set_ranks';
import set from '../commands/auth/set';
import url from '../commands/auth/url';

export async function commandLoader(
  interaction: ChatInputCommandInteraction,
  command: AuthCommands | NoAuthCommands,
  args: string[],
  pGuild: PGuild,
  client: Client,
  scopeLimit: ScopeLimit,
  commandOptions: CommandOptions,
  activeCooldowns: ActiveCooldowns
) {
  if (scopeLimit === 'none' && commandOptions.time === 0) {
    return await commandExecution(interaction, command, args, pGuild, client);
  }

  const cooldown = hasActiveCooldown(interaction, command, scopeLimit, activeCooldowns);

  if (cooldown) {
    logger.info(`User ${interaction.user.id} tried to use ${command} but is on cooldown`);

    const time = timeElapsed(cooldown.timestamp, commandOptions.time);

    const typeForMessage =
      scopeLimit !== ScopeLimit.MEMBER ? `, as it was used again in* **${interaction.guild?.name}**` : `.*`;

    const mustWaitMessage =
      `you need to wait **${pad(time.remainingMin)}:` +
      `${pad(time.remainingSec)}/${pad(time.timeoutMin)}:` +
      `${pad(time.timeoutSec)}** *to use* **${command}** *again${typeForMessage}`;

    return {
      result: false,
      value: mustWaitMessage,
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

    if (commandOptions) {
      setTimeout(() => {
        const updatedCooldown = activeCooldown.filter((active) => active.command !== command);
        if (scopeLimit === ScopeLimit.GUILD) {
          activeCooldowns['guild'] = updatedCooldown;
        } else {
          activeCooldowns['member'] = updatedCooldown;
        }
      }, commandOptions.time * 60 * 1000);
    }
  }

  return commandReturn;
}

// export async function commandLoaderOld(
//   client: Client,
//   message: Message,
//   command: AuthCommands | NoAuthCommands,
//   args: string[],
//   scopeLimit: ScopeLimit,
//   commandOptions: CommandOptions,
//   pGuild: PGuild
//   // activeCooldowns: ActiveCooldowns
// ) {
//   if (scopeLimit === 'none' && commandOptions.time === 0) {
//     const commandReturn = await commandResolver(command)
//       .execute(message, args, pGuild, client)
//       .catch((e: string) => {
//         messageReply(false, message, e, commandOptions.delete.source, commandOptions.delete.reply).catch((e) =>
//           logger.error(new Error('failed to send message'))
//         );
//       });

//     if (commandReturn) {
//       messageReply(
//         commandReturn.result,
//         message,
//         commandReturn.value,
//         commandOptions.delete.source,
//         commandOptions.delete.reply
//       ).catch(() => logger.error(new Error('failed to send message')));
//     }

//     return;
//   }

//   const active = activeCooldowns[scopeLimit].find((activeCurrent) => {
//     if (activeCurrent.command === command) {
//       if (scopeLimit === ScopeLimit.MEMBER && activeCurrent.member === message.author.id) {
//         if (message.guild && activeCurrent.guild === message.guild.id) {
//           return true;
//         }
//       }

//       if (scopeLimit === ScopeLimit.GUILD) {
//         if (message.guild && activeCurrent.guild === message.guild.id) {
//           return true;
//         }
//       }
//     }

//     return false;
//   });

//   if (active) {
//     const time = timeElapsed(active.timestamp, commandOptions.time);

//     const typeForMessage =
//       scopeLimit !== ScopeLimit.MEMBER ? `, as it was used again in* **${message.guild?.name}**` : `.*`;

//     const mustWaitMessage =
//       `you need to wait **${pad(time.remainingMin)}:` +
//       `${pad(time.remainingSec)}/${pad(time.timeoutMin)}:` +
//       `${pad(time.timeoutSec)}** *to use* **${command}** *again${typeForMessage}`;

//     messageReply(false, message, mustWaitMessage, true, true).catch((e) =>
//       logger.error(new Error(`failed to reply to message: ${e}`))
//     );

//     return;
//   }

//   let commandReturn: ReturnPromise;
//   try {
//     commandReturn = await commandResolver(command).execute(message, args, pGuild, client);
//   } catch (e) {
//     logger.error(new Error(`in ${command} got error ${e}`));
//     throw Error('Got error in command execution');
//   }

//   if (commandReturn) {
//     if (commandReturn.result) {
//       if (message.guild) {
//         activeCooldowns[scopeLimit].push({
//           member: message.author.id,
//           guild: message.guild.id,
//           command: command,
//           timestamp: Date.now(),
//         });

//         if (commandOptions) {
//           setTimeout(() => {
//             activeCooldowns[scopeLimit] = activeCooldowns[scopeLimit].filter((active) => active.command !== command);
//           }, commandOptions.time * 60 * 1000);
//         }
//       }
//     }

//     messageReply(
//       commandReturn.result,
//       message,
//       commandReturn.value,
//       commandOptions.delete.source,
//       commandOptions.delete.reply
//     ).catch((e) => {
//       logger.error(new Error(`in ${command} got error ${e}`));
//     });
//   } else {
//     logger.error(new Error(`did not get response from command: ${command}`));
//   }
// }

export function commandResolver(command: AuthCommands | NoAuthCommands) {
  let commandFile = undefined;

  switch (command) {
    case 'about':
      commandFile = about;
      break;
    case 'ai':
      commandFile = ai;
      break;
    case 'announce':
      commandFile = announce;
      break;
    case 'bet':
      commandFile = bet;
      break;
    case 'corona':
      commandFile = corona;
      break;
    case 'crypto':
      commandFile = crypto;
      break;
    case 'focus':
      commandFile = focus;
      break;
    case 'football':
      commandFile = football;
      break;
    case 'help':
      commandFile = help;
      break;
    case 'join':
      commandFile = join;
      break;
    case 'joke':
      commandFile = joke;
      break;
    case 'leaderboard':
      commandFile = leaderboard;
      break;
    case 'leave':
      commandFile = leave;
      break;
    case 'level':
      commandFile = level;
      break;
    case 'news':
      commandFile = news;
      break;
    case 'ping':
      commandFile = ping;
      break;
    case 'poll':
      commandFile = poll;
      break;
    case 'ranks':
      commandFile = ranks;
      break;
    case 'roll':
      commandFile = roll;
      break;
    case 'run':
      commandFile = run;
      break;
    case 'state':
      commandFile = state;
      break;
    case 'spam_rules':
      commandFile = spam_rules;
      break;
    case 'weather':
      commandFile = weather;
      break;
    case 'whoami':
      commandFile = whoami;
      break;
    case 'announcement':
      commandFile = announcement;
      break;
    case 'ban':
      commandFile = ban;
      break;
    case 'delete_messages':
      commandFile = delete_messages;
      break;
    case 'force':
      commandFile = force;
      break;
    case 'ignore':
      commandFile = ignore;
      break;
    case 'invite':
      commandFile = invite;
      break;
    case 'kick':
      commandFile = kick;
      break;
    case 'music':
      commandFile = music;
      break;
    case 'portal':
      commandFile = portal;
      break;
    case 'vendor':
      commandFile = vendor;
      break;
    case 'set_ranks':
      commandFile = set_ranks;
      break;
    case 'set':
      commandFile = set;
      break;
    case 'url':
      commandFile = url;
      break;
    default:
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
    return await commandResolver(command).execute(interaction, args, pGuild, client);
  } catch (e) {
    logger.error(new Error(`While executing ${command}, got error: ${e}`));
    return {
      result: false,
      value: `While executing ${command}, got error: ${e}`,
    }
  }
}

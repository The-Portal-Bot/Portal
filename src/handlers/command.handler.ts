// import eventConfigJson from '../config.event.json';
import { Client, Message } from 'discord.js';
import { logger, messageReply, pad, timeElapsed } from '../libraries/help.library';
import { PGuild } from '../types/classes/PGuild.class';
import { ActiveCooldowns, CommandOptions, ReturnPromise } from '../types/classes/PTypes.interface';
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
import spamRules from '../commands/noAuth/spamRules';
import weather from '../commands/noAuth/weather';
import whoami from '../commands/noAuth/whoami';
import announcement from '../commands/auth/announcement';
import ban from '../commands/auth/ban';
import deleteMessages from '../commands/auth/deleteMessages';
import force from '../commands/auth/force';
import ignore from '../commands/auth/ignore';
import invite from '../commands/auth/invite';
import kick from '../commands/auth/kick';
import music from '../commands/auth/music';
import portal from '../commands/auth/portal';
import vendor from '../commands/auth/vendor';
import setRanks from '../commands/auth/setRanks';
import set from '../commands/auth/set';
import url from '../commands/auth/url';

export type noAuthCommands =
    | 'about'
    | 'ai'
    | 'announce'
    | 'bet'
    | 'corona'
    | 'crypto'
    | 'focus'
    | 'football'
    | 'help'
    | 'join'
    | 'joke'
    | 'leaderboard'
    | 'leave'
    | 'level'
    | 'news'
    | 'ping'
    | 'poll'
    | 'ranks'
    | 'roll'
    | 'run'
    | 'state'
    | 'spamRules'
    | 'weather'
    | 'whoami';
export type authCommands =
    | 'announcement'
    | 'ban'
    | 'deleteMessages'
    | 'force'
    | 'ignore'
    | 'invite'
    | 'kick'
    | 'music'
    | 'portal'
    | 'vendor'
    | 'setRanks'
    | 'set'
    | 'url';

export async function commandLoader(
  client: Client,
  message: Message,
  command: authCommands | noAuthCommands,
  args: string[],
  type: string,
  commandOptions: CommandOptions,
  pGuild: PGuild,
  activeCooldowns: ActiveCooldowns
) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (process.env.DEBUG!) {
    logger.info(`[command-debug] ${command}`);
  }

  if (type === 'none' && commandOptions.time === 0) {
    const commandReturn = await commandResolver(command)
      .execute(message, args, pGuild, client)
      .catch((e: string) => {
        messageReply(false, message, e, commandOptions.delete.source, commandOptions.delete.reply).catch((e) =>
          logger.error(new Error('failed to send message'))
        );
      });

    if (commandReturn) {
      messageReply(
        commandReturn.result,
        message,
        commandReturn.value,
        commandOptions.delete.source,
        commandOptions.delete.reply
      ).catch((e) => logger.error(new Error('failed to send message')));
    }

    return;
  }

  const typeString = type === 'guild' ? 'guild' : 'member';

  const active = activeCooldowns[typeString].find((activeCurrent) => {
    if (activeCurrent.command === command) {
      if (type === 'member' && activeCurrent.member === message.author.id) {
        if (message.guild && activeCurrent.guild === message.guild.id) {
          return true;
        }
      }

      if (type === 'guild') {
        if (message.guild && activeCurrent.guild === message.guild.id) {
          return true;
        }
      }
    }

    return false;
  });

  if (active) {
    const time = timeElapsed(active.timestamp, commandOptions.time);

    const typeForMsg = type !== 'member' ? `, as it was used again in* **${message.guild?.name}**` : `.*`;

    const mustWaitMsg =
            `you need to wait **${pad(time.remainingMin)}:` +
            `${pad(time.remainingSec)}/${pad(time.timeoutMin)}:` +
            `${pad(time.timeoutSec)}** *to use* **${command}** *again${typeForMsg}`;

    messageReply(false, message, mustWaitMsg, true, true).catch((e) =>
      logger.error(new Error(`failed to reply to message: ${e}`))
    );

    return;
  }

  let commandReturn: ReturnPromise;
  try {
    commandReturn = await commandResolver(command).execute(message, args, pGuild, client);
  } catch (e) {
    logger.error(new Error(`in ${command} got error ${e}`));
    throw Error('Got error in command execution');
  }

  if (commandReturn) {
    if (commandReturn.result) {
      if (message.guild) {
        activeCooldowns[typeString].push({
          member: message.author.id,
          guild: message.guild.id,
          command: command,
          timestamp: Date.now(),
        });

        if (commandOptions) {
          setTimeout(() => {
            activeCooldowns[typeString] = activeCooldowns[typeString].filter(
              (active) => active.command !== command
            );
          }, commandOptions.time * 60 * 1000);
        }
      }
    }

    messageReply(
      commandReturn.result,
      message,
      commandReturn.value,
      commandOptions.delete.source,
      commandOptions.delete.reply
    ).catch((e) => {
      logger.error(new Error(`in ${command} got error ${e}`));
    });
  } else {
    logger.error(new Error(`did not get response from command: ${command}`));
  }
}

export function commandResolver(command: authCommands | noAuthCommands) {
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
  case 'spamRules':
    commandFile = spamRules;
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
  case 'deleteMessages':
    commandFile = deleteMessages;
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
  case 'setRanks':
    commandFile = setRanks;
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

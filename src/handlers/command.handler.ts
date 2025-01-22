import type { ChatInputCommandInteraction } from "npm:discord.js";

import * as auth from "../commands/auth/index.ts";
import * as noAuth from "../commands/noAuth/index.ts";
import { getElapsedTime, pad } from "../libraries/help.library.ts";
import type { PGuild } from "../types/classes/PGuild.class.ts";
import {
  type ActiveCooldowns,
  type AuthCommands,
  type NoAuthCommands,
  ScopeLimit,
} from "../types/classes/PTypes.interface.ts";
import logger from "../utilities/log.utility.ts";

export async function commandLoader(
  interaction: ChatInputCommandInteraction,
  command: AuthCommands | NoAuthCommands,
  pGuild: PGuild,
  scopeLimit: ScopeLimit,
  time: number,
  activeCooldowns: ActiveCooldowns,
) {
  if (scopeLimit === ScopeLimit.NONE && time === 0) {
    return await commandExecution(interaction, command, pGuild);
  }

  const cooldown = hasActiveCooldown(
    interaction,
    command,
    scopeLimit,
    activeCooldowns,
  );

  if (cooldown) {
    logger.info(
      `User ${interaction.user.id} tried to use ${command} but is on cooldown`,
    );

    const elapsedTime = getElapsedTime(cooldown.timestamp, time);

    const ending = scopeLimit !== ScopeLimit.MEMBER
      ? `, as it was used again in* **${interaction.guild?.name}**`
      : ".*";
    const awaitMessage =
      `you need to wait **${pad(elapsedTime.remainingMin)}:` +
      `${pad(elapsedTime.remainingSec)}/${pad(elapsedTime.timeoutMin)}:` +
      `${
        pad(elapsedTime.timeoutSec)
      }** *to use* **${command}** *again${ending}`;

    return {
      result: false,
      value: awaitMessage,
    };
  }

  const commandReturn = await commandExecution(interaction, command, pGuild);

  if (commandReturn.result) {
    const activeCooldown = scopeLimit === ScopeLimit.GUILD
      ? activeCooldowns[ScopeLimit.GUILD]
      : activeCooldowns[ScopeLimit.MEMBER];

    activeCooldown.push({
      member: interaction.user.id,
      guild: interaction?.guild?.id ?? "null",
      command: command,
      timestamp: Date.now(),
    });

    if (time) {
      setTimeout(
        () => {
          const updatedCooldown = activeCooldown.filter((active) =>
            active.command !== command
          );
          if (scopeLimit === ScopeLimit.GUILD) {
            activeCooldowns[ScopeLimit.GUILD] = updatedCooldown;
          } else {
            activeCooldowns[ScopeLimit.MEMBER] = updatedCooldown;
          }
        },
        time * 60 * 1000,
      );
    }
  }

  return commandReturn;
}

export function commandResolver(command: AuthCommands | NoAuthCommands) {
  const commandData = [...Object.values(auth), ...Object.values(noAuth)].find(
    (commandData) => commandData.slashCommand.name === command,
  );

  if (!commandData) {
    throw Error(`command ${command} not found`);
  }

  return commandData;
}

function hasActiveCooldown(
  interaction: ChatInputCommandInteraction,
  command: AuthCommands | NoAuthCommands,
  scopeLimit: Omit<ScopeLimit, ScopeLimit.NONE>,
  activeCooldowns: ActiveCooldowns,
) {
  const activeCooldown = scopeLimit === ScopeLimit.GUILD
    ? activeCooldowns[ScopeLimit.GUILD]
    : activeCooldowns[ScopeLimit.MEMBER];

  return activeCooldown.find((activeCurrent) => {
    if (activeCurrent.command === command) {
      if (
        scopeLimit === ScopeLimit.MEMBER &&
        activeCurrent.member === interaction?.user.id
      ) {
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
  pGuild: PGuild,
) {
  try {
    return await commandResolver(command).execute(interaction, pGuild);
  } catch (e) {
    logger.error(`While executing ${command}, got error: ${e}`);

    return {
      result: false,
      value: `Error while executing ${command}:\n\t${e}`,
    };
  }
}

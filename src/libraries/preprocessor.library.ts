import * as auth from "../commands/auth/index.ts";
import * as noAuth from "../commands/noAuth/index.ts";
import type {
  AuthCommands,
  CommandOptions,
  NoAuthCommands,
} from "../types/classes/PTypes.interface.ts";

/**
 * Fetches command metadata by command name.
 * This function is used by the interaction handler to get command options.
 *
 * Note: Message content dependent functions have been removed since
 * the bot no longer has the MessageContent privileged intent.
 * Music and other functionality now uses slash commands instead.
 */
export function commandFetcher(commandName: AuthCommands | NoAuthCommands) {
  const authCommand = [...Object.values(auth)].find((command) =>
    command.slashCommand.name === commandName
  );

  if (authCommand) {
    return {
      name: authCommand.slashCommand.name,
      description: authCommand.slashCommand.description,
      auth: authCommand.auth,
      scopeLimit: authCommand.scopeLimit,
      time: authCommand.time,
      premium: authCommand.premium,
      ephemeral: authCommand.ephemeral,
    } as CommandOptions;
  }

  const noAuthCommand = [...Object.values(noAuth)].find((command) =>
    command.slashCommand.name === commandName
  );

  if (noAuthCommand) {
    return {
      name: noAuthCommand.slashCommand.name,
      description: noAuthCommand.slashCommand.description,
      auth: noAuthCommand.auth,
      scopeLimit: noAuthCommand.scopeLimit,
      time: noAuthCommand.time,
      premium: noAuthCommand.premium,
      ephemeral: noAuthCommand.ephemeral,
    } as CommandOptions;
  }

  return undefined;
}

import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "npm:discord.js";
import type { PGuild } from "./classes/PGuild.class.ts";
import type { ReturnPromise, ScopeLimit } from "./classes/PTypes.interface.ts";

export type Command = {
  time: number;
  premium: boolean;
  ephemeral: boolean;
  auth: boolean;
  scopeLimit: ScopeLimit;
  slashCommand: SlashCommandBuilder;
  execute: (
    interaction: ChatInputCommandInteraction,
    pGuild?: PGuild,
  ) => Promise<ReturnPromise>;
};

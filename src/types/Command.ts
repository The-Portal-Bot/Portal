import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PGuild } from './classes/PGuild.class.js';
import { ReturnPromise, ScopeLimit } from './classes/PTypes.interface.js';

export type Command = {
  time: number;
  premium: boolean;
  ephemeral: boolean;
  auth: boolean;
  scopeLimit: ScopeLimit;
  slashCommand: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction, pGuild?: PGuild) => Promise<ReturnPromise>;
};

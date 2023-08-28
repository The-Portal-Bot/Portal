import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ReturnPromise, ScopeLimit } from './classes/PTypes.interface';
import { PGuild } from './classes/PGuild.class';

export type Command = {
    time: number;
    premium: boolean;
    ephemeral: boolean;
    auth: boolean;
    scopeLimit: ScopeLimit;
    slashCommand: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction, pGuild?: PGuild) => Promise<ReturnPromise>;
}
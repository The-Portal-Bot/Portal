import { Client, Guild } from "discord.js";
import { guildExists, insertGuild } from "../libraries/mongo.library";

export default async (
  args: { client: Client, guild: Guild }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    guildExists(args.guild.id)
      .then(exists => {
        if (exists) {
          return resolve(`guild ${args.guild.name} [${args.guild.id}] already in database`);
        } else {
          insertGuild(args.guild.id, args.client)
            .then(r => {
              if (r) {
                return resolve(`joined guild ${args.guild.name} [${args.guild.id}]`);
              } else {
                return reject(`failed to join guild ${args.guild.name} [${args.guild.id}]`);
              }
            })
            .catch(e => {
              return reject(`failed to join guild ${args.guild.name} [${args.guild.id}]: ${e}`);
            });
        }
      })
      .catch(e => {
        return reject(`failed to get data for guild: ${e}`);
      });
  });
};
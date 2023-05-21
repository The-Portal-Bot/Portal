/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Message } from "discord.js";
import { JokeType } from "../../data/enums/Joke.enum";
import { getKeyFromEnum } from "../../libraries/help.library";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

const giveMeAJoke = require('give-me-a-joke');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('returns a joke'),
  async execute(
    message: Message, args: string[]
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      const category = getKeyFromEnum(args[0], JokeType);

      if (args.length === 1) {
        switch (category) {
        case JokeType.dad:
          giveMeAJoke.getRandomDadJoke((joke: string) =>
            message.channel.send(joke));
          break;
        case JokeType.chuck:
          giveMeAJoke.getRandomCNJoke((joke: string) =>
            message.channel.send(joke));
          break;
        case JokeType.blonde:
          giveMeAJoke.getRandomJokeOfTheDay('blonde', (joke: string) =>
            message.channel.send(joke));
          break;
        case JokeType.knock:
          giveMeAJoke.getRandomJokeOfTheDay('knock-knock', (joke: string) =>
            message.channel.send(joke));
          break;
        case JokeType.animal:
          giveMeAJoke.getRandomJokeOfTheDay('animal', (joke: string) =>
            message.channel.send(joke));
          break;
        default:
          giveMeAJoke.getCustomJoke('', args[0], (joke: string) =>
            message.channel.send(joke));
        }
      } else {
        giveMeAJoke.getCustomJoke('', message.author.username, (joke: string) =>
          message.channel.send(joke));
      }

      return resolve({
        result: true,
        value: ''
      });
    });
  }
};

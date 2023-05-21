import { Message } from "discord.js";
import { JokeType } from "../../types/enums/Joke.enum";
import { getKeyFromEnum } from "../../libraries/help.library";
import { ReturnPromise } from "../../types/classes/PTypes.interface";
import { SlashCommandBuilder } from '@discordjs/builders';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const giveMeAJoke = require('give-me-a-joke');

export = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('returns a joke'),
  async execute(
    message: Message, args: string[]
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      const category = getKeyFromEnum(args[0], typeof JokeType);

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

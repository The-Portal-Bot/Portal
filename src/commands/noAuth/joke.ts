import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { getKeyFromEnum } from '../../libraries/help.library';
import { ReturnPromise } from '../../types/classes/PTypes.interface';
import { JokeType } from '../../types/enums/Joke.enum';

// const giveMeAJoke  = require('give-me-a-joke');

export = {
  data: new SlashCommandBuilder().setName('joke').setDescription('returns a joke'),
  async execute(interaction: ChatInputCommandInteraction, args: string[]): Promise<ReturnPromise> {
    const category = getKeyFromEnum(args[0], JokeType);

    if (args.length === 1) {
      switch (category) {
      case JokeType.dad:
        // giveMeAJoke.getRandomDadJoke((joke: string) => message.channel.send(joke));
        break;
      case JokeType.chuck:
        // giveMeAJoke.getRandomCNJoke((joke: string) => message.channel.send(joke));
        break;
      case JokeType.blonde:
        // giveMeAJoke.getRandomJokeOfTheDay('blonde', (joke: string) => message.channel.send(joke));
        break;
      case JokeType.knock:
        // giveMeAJoke.getRandomJokeOfTheDay('knock-knock', (joke: string) => message.channel.send(joke));
        break;
      case JokeType.animal:
        // giveMeAJoke.getRandomJokeOfTheDay('animal', (joke: string) => message.channel.send(joke));
        break;
      default:
          // giveMeAJoke.getCustomJoke('', args[0], (joke: string) => message.channel.send(joke));
      }
    } else {
      // giveMeAJoke.getCustomJoke('', message.author.username, (joke: string) => message.channel.send(joke));
    }

    return {
      result: true,
      value: '',
    };
  },
};

import { SlashCommandBuilder } from '@discordjs/builders';
import { ColorResolvable, Message, TextChannel } from "discord.js";
import { getRole } from "../../libraries/guild.library";
import { createEmbed, getJsonFromString, messageHelp } from "../../libraries/help.library";
import { insertVendor } from "../../libraries/mongo.library";
import { GiveRole, PGiveRole } from "../../types/classes/PGiveRole.class";
import { PGuild } from "../../types/classes/PGuild.class";
import { Field, ReturnPromise } from "../../types/classes/PTypes.interface";

function createRoleMessage(
  channel: TextChannel, pGuild: PGuild, title: string, desc: string,
  colour: ColorResolvable, roleEmb: Field[], roleMap: GiveRole[]
): Promise<ReturnPromise> {
  return new Promise((resolve) => {
    const roleMessageEmb = createEmbed(
      title, desc, colour, roleEmb, null, null, null, null, null
    );

    channel
      .send({ embeds: [roleMessageEmb] })
      .then(sentMessage => {
        for (let i = 0; i < roleMap.length; i++) {
          sentMessage
            .react(roleMap[i].emote)
            .catch((e) => {
              return resolve({
                result: false,
                value: `failed to react to message: ${e}`
              });
            });
        }

        insertVendor(pGuild.id, new PGiveRole(sentMessage.id, roleMap))
          .then(r => {
            return resolve({
              result: r,
              value: r
                ? 'Keep in mind that Portal role must be over any role you wish it to be able to distribute.\n' +
                                'In order to change it, please head to your servers settings and put Portal role above them'
                : 'failed to set new ranks'
            });
          })
          .catch(() => {
            return resolve({
              result: false,
              value: 'failed to set new ranks'
            });
          });
      })
      .catch(() => {
        return resolve({
          result: false,
          value: 'failed to create role assigner message'
        })
      });
  });
}

function multipleSameEmote(
  emoteMap: GiveRole[]
) {
  for (let i = 0; i < emoteMap.length; i++) {
    for (let j = i + 1; j < emoteMap.length; j++) {
      if (emoteMap[i].emote === emoteMap[j].emote) {
        return true;
      }
    }
  }

  return false;
}

export = {
  data: new SlashCommandBuilder()
    .setName('vendor')
    .setDescription('remove user from role'),
  async execute(
    message: Message, args: string[], pGuild: PGuild
  ): Promise<ReturnPromise> {
    return new Promise((resolve) => {
      if (!message.guild) {
        return resolve({
          result: true,
          value: 'guild could not be fetched'
        });
      }
      if (args.length <= 0) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'vendor')
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const roleMapJson = getJsonFromString(args.join(' '));

      if (!roleMapJson) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'vendor', 'must be an array in JSON format (even for one role)')
        });
      }

      const roleMap = <GiveRole[]>roleMapJson;
      if (!Array.isArray(roleMap)) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'vendor', 'must be an array in JSON format (even for one role)')
        });
      }
      if (multipleSameEmote(roleMap)) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'vendor', 'can not have the same emote for multiple actions')
        });
      }
      if (!roleMap.every(rm => rm.emote && rm.role)) {
        return resolve({
          result: false,
          value: messageHelp('commands', 'vendor', 'JSON syntax has spelling errors')
        });
      }

      roleMap
        .forEach(r => {
          r.emote = r.emote.trim();
          r.role.forEach(role => role.trim());
        });

      const roleEmbDisplay: Field[] = [];

      let returnValue = '';
      // give roles
      const failed = roleMap
        .some(r => {
          if (message.guild) {
            const roleFetched = r.role.map(role => getRole(message.guild, role));

            if (roleFetched.some(role => !role)) {
              returnValue = `some of the given roles do not exist`;
              return true;
            }

            roleEmbDisplay.push(
              new Field(
                r.emote,
                `\`\`\`${roleFetched.map(role =>
                  `@${role ? role.name : 'undefined'}`).join(', ')}\`\`\``,
                true
              )
            );
          } else {
            returnValue = `could not fetch guild of message`;
            return true;
          }
        });

      if (failed) {
        return resolve({
          result: false,
          value: returnValue
        });
      }

      createRoleMessage(
                <TextChannel>message.channel,
                pGuild,
                'Role Assigner',
                'React with emote to get or remove mentioned role',
                '#FF7F00',
                roleEmbDisplay,
                roleMap
      )
        .then(r => {
          return resolve(r);
        })
        .catch(e => {
          return resolve({
            result: false,
            value: `an error occurred while creating role message: ${e}`
          })
        });
    });
  }
};

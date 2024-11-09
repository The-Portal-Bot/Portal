import dayjs from "npm:dayjs";
import { type BanOptions, type Message, TextChannel } from "npm:discord.js";

import { ProfaneWords } from "../assets/lists/profaneWords.static.ts";
import configSpam from "../config.spam.json" with { type: "json" };
import type { PGuild } from "../types/classes/PGuild.class.ts";
import type { SpamCache } from "../types/classes/PTypes.interface.ts";
import { ProfanityLevel } from "../types/enums/ProfanityLevel.enum.ts";
import logger from "../utilities/log.utility.ts";
import { deleteMessage, getRole } from "./guild.library.ts";
import { isWhitelist, messageReply } from "./help.library.ts";
import { updateMember } from "./mongo.library.ts";
import { ban, kick } from "./user.library.ts";

const profaneWords = ProfaneWords as {
  gr: string[];
  de: string[];
  en: string[];
};

/**
 * Determine if a string contains profane words
 */
export function isProfane(candidate: string, profanityLevel: number): string[] {
  const gr = profaneWords.gr.filter((word: string) => {
    return candidate.toLowerCase() === word.toLowerCase();
  });

  const en = profaneWords.en.filter((word: string) => {
    const wordExp = new RegExp(
      ProfanityLevel.default === profanityLevel
        ? `\\b(${word})\\b`
        : `\\b(\\w*${word}\\w*)\\b`,
      "gi",
    );

    return wordExp.test(candidate);
  });

  const de = profaneWords.de.filter((word: string) => {
    const wordExp = new RegExp(
      ProfanityLevel.default === profanityLevel
        ? `\\b(${word})\\b`
        : `\\b(\\w*${word}\\w*)\\b`,
      "gi",
    );

    return wordExp.test(candidate);
  });

  return gr.length > 0 && en.length > 0 && de.length > 0
    ? gr.concat(en).concat(de)
    : [];
}

/**
 * Determines if a user is spamming
 */
export function messageSpamCheck(
  message: Message,
  pGuild: PGuild,
  spamCache: SpamCache[],
): void {
  if (isWhitelist(message.member)) {
    return;
  }

  const memberSpamCache = spamCache.find((c) =>
    c.memberId === message.author.id
  );

  if (!memberSpamCache) {
    spamCache.push({
      memberId: message.author.id,
      lastMessage: message.content,
      timestamp: new Date(),
      spamFouls: 1,
      duplicateFouls: 1,
    });

    return;
  }

  if (!memberSpamCache.timestamp) {
    memberSpamCache.memberId = message.author.id;
    memberSpamCache.lastMessage = message.content;
    memberSpamCache.timestamp = new Date();
    memberSpamCache.spamFouls = 0;
    memberSpamCache.duplicateFouls = 0;

    return;
  }

  const elapsedTime = dayjs.duration(
    dayjs().diff(dayjs(memberSpamCache.timestamp.getTime())),
  );

  if (elapsedTime.asSeconds() > configSpam.MESSAGE_INTERVAL / 1000) {
    memberSpamCache.timestamp = null;
    memberSpamCache.spamFouls = 0;
    memberSpamCache.duplicateFouls = 0;

    return;
  }

  if (memberSpamCache.lastMessage === message.content) {
    memberSpamCache.spamFouls++;
    memberSpamCache.duplicateFouls++;
  } else {
    memberSpamCache.spamFouls++;
    memberSpamCache.duplicateFouls = 0;
  }

  if (
    configSpam.DUPLICATE_AFTER !== 0 &&
    memberSpamCache.duplicateFouls === configSpam.DUPLICATE_AFTER
  ) {
    messageReply(
      false,
      message,
      "warning: please stop spamming the same message",
      false,
      true,
    ).catch((e) => {
      logger.error(`failed to reply to message: ${e}`);
    });

    memberSpamCache.timestamp = new Date();
  } else if (
    configSpam.WARN_AFTER !== 0 &&
    memberSpamCache.spamFouls === configSpam.WARN_AFTER
  ) {
    messageReply(
      false,
      message,
      "warning: please stop spamming messages",
      false,
      true,
    ).catch((e) => {
      logger.error(`failed to reply to message: ${e}`);
    });

    memberSpamCache.timestamp = new Date();
  }

  if (
    configSpam.MUTE_AFTER !== 0 &&
    memberSpamCache.spamFouls === configSpam.MUTE_AFTER
  ) {
    memberSpamCache.timestamp = null;
    memberSpamCache.spamFouls = 0;

    if (pGuild.pMembers[0].penalties) {
      pGuild.pMembers[0].penalties++;
    } else {
      pGuild.pMembers[0].penalties = 1;
    }

    if (
      pGuild.kickAfter && pGuild.kickAfter !== 0 &&
      pGuild.pMembers[0].penalties === pGuild.kickAfter
    ) {
      if (message.member) {
        kick(message.member, "kicked due to spamming")
          .then((r) => {
            const replyMessage = r
              ? `kicked ${message.author} due to spamming`
              : `member ${message.author} cannot be kicked`;

            messageReply(false, message, replyMessage, false, true).catch(
              (e) => {
                logger.error(`failed to reply to message: ${e}`);
              },
            );
          })
          .catch((e) => {
            logger.error(`failed to kick member: ${e}`);
          });
      } else {
        messageReply(
          false,
          message,
          `could not kick ${message.author}`,
          false,
          true,
        ).catch((e) => {
          logger.error(`failed to reply to message: ${e}`);
        });
      }
    } else if (
      pGuild.banAfter && pGuild.banAfter !== 0 &&
      pGuild.pMembers[0].penalties === pGuild.banAfter
    ) {
      if (message.member) {
        const banOptions: BanOptions = {
          deleteMessageDays: 0,
          reason: "banned due to spamming",
        };

        ban(message.member, banOptions)
          .then((r) => {
            const replyMessage = r
              ? `banned ${message.author} due to spamming`
              : `member ${message.author} cannot be banned`;

            messageReply(false, message, replyMessage, false, true).catch(
              (e) => {
                logger.error(`failed to reply to message: ${e}`);
              },
            );
          })
          .catch((e) => {
            logger.error(`failed to ban member: ${e}`);
          });
      } else {
        messageReply(
          false,
          message,
          `could not kick ${message.author}`,
          false,
          true,
        ).catch((e) => {
          logger.error(`failed to reply to message: ${e}`);
        });
      }
    } else {
      updateMember(
        pGuild.id,
        message.author.id,
        "penalties",
        pGuild.pMembers[0].penalties,
      ).catch((e) => {
        logger.error(`failed to update member: ${e}`);
      });

      if (pGuild.muteRole) {
        muteUser(message, pGuild.muteRole);
      }
    }
  }
}

/**
 * Give member a role
 */
async function muteUser(message: Message, muteRoleId: string): Promise<void> {
  const muteRole = getRole(message.guild, muteRoleId);
  if (!muteRole) {
    return;
  }

  const channel = message.channel;
  if (!channel || !channel.isTextBased()) {
    return;
  }

  const addedRole = await message.member?.roles.add(muteRole);

  if (!addedRole) {
    logger.error("failed to give role to member");
    return;
  }

  if (channel instanceof TextChannel) {
    const messageSent = await channel.send(
      `user ${message.author}, has been muted for ${configSpam.MUTE_PERIOD} minutes`,
    );
    deleteMessage(messageSent);

    setTimeout(
      () => {
        const muteRole = getRole(message.guild, muteRoleId);

        if (!muteRole) {
          return;
        }

        message.member?.roles
          .remove(muteRole)
          .then(() =>
            channel
              .send(`user ${message.author}, has been unmuted`)
              .then((message) => {
                if (message.deletable) {
                  deleteMessage(message);
                }
              })
              .catch((e) => {
                logger.error(`failed to reply to message: ${e}`);
              })
          )
          .catch(logger.error);
      },
      configSpam.MUTE_PERIOD * 60 * 1000,
    );
  }
}

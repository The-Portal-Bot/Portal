import {
  type ActivityOptions,
  ActivityType,
  type Client,
  type Guild,
  type PresenceData,
  type PresenceStatusData,
} from "npm:discord.js";

import {
  removeDeletedChannels,
  removeEmptyVoiceChannels,
} from "../libraries/help.library.ts";
import { getFunction } from "../libraries/localisation.library.ts";
import {
  fetchGuildMembers,
  guildExists,
  insertGuild,
  insertMember,
  removeMember,
} from "../libraries/mongo.library.ts";
import type { PMember } from "../types/classes/PMember.class.ts";
import { LogActions } from "../types/classes/PTypes.interface.ts";
import logger from "../utilities/log.utility.ts";

export async function ready(client: Client): Promise<void> {
  if (!client.user) {
    logger.warn("could not fetch user from client");
    return;
  }

  const activitiesOptions: ActivityOptions = {
    name: "./help", // `in ${client.guilds.cache.size} servers``
    type: ActivityType.Listening,
    url: "https://github.com/keybraker",
  };

  const presenceData: PresenceData = {
    activities: [activitiesOptions],
    status: "online" satisfies PresenceStatusData,
    afk: false,
  };

  await client.user.setPresence(presenceData);

  let index = 0;
  client.guilds.cache.forEach((guild: Guild) => {
    logger.info(`${index++}. logged onto guild ${guild} (${guild.id})`);

    addGuildAgain(guild, client).catch((e) =>
      logger.warn(`failed to add guild ${guild.name} [${guild.id}] (${e})`)
    );

    removeDeletedChannels(guild);
    removeEmptyVoiceChannels(guild);
  });

  const func = getFunction("console", 1, LogActions.ready) as unknown as (
    args: {
      memberLength: number;
      channelLength: number;
      guildLength: number;
    },
  ) => string;

  logger.info(
    func({
      memberLength: client.users.cache.size,
      channelLength: client.channels.cache.size,
      guildLength: client.guilds.cache.size,
    }),
  );
}

async function addedWhenDown(guild: Guild, pMembers: PMember[]): Promise<void> {
  const membersFetched = await guild.members.fetch();
  const members = membersFetched.map((member) => member).filter((member) =>
    !member.user.bot
  );

  for (let j = 0; j < members.length; j++) {
    const alreadyInDatabase = pMembers.find((pMember) =>
      pMember.id === members[j].id
    );

    if (alreadyInDatabase) {
      continue;
    }

    logger.info(
      `inserting member: ${members[j].id} to ${guild.name} [${guild.id}]`,
    );

    // if member is inside guild but not in portal db, add member
    const memberInserted = await insertMember(guild.id, members[j].id);

    if (!memberInserted) {
      logger.error("failed to late-insert member");
    } else {
      logger.info(
        `late-insert ${members[j].id} to ${guild.name} [${guild.id}]`,
      );
    }
  }
}

async function removedWhenDown(
  guild: Guild,
  pMembers: PMember[],
): Promise<void> {
  const membersFetched = await guild.members.fetch();
  const members = membersFetched.map((member) => member).filter((member) =>
    !member.user.bot
  );

  for (let j = 0; j < pMembers.length; j++) {
    const member = members.find((member) => member.id === pMembers[j].id);

    if (member) {
      continue;
    }

    logger.info(
      `removing member: ${pMembers[j].id} from ${guild.name} [${guild.id}]`,
    );

    const memberRemoved = await removeMember(pMembers[j].id, guild.id);

    if (!memberRemoved) {
      logger.error("failed to late-remove member");
    } else {
      logger.info(
        `late-remove ${pMembers[j].id} to ${guild.name} [${guild.id}]`,
      );
    }
  }
}

async function addGuildAgain(guild: Guild, client: Client): Promise<boolean> {
  if (!(await guildExists(guild.id))) {
    return await insertGuild(guild.id, client);
  }

  const pMembers = await fetchGuildMembers(guild.id);

  if (!pMembers) {
    return false;
  }

  await addedWhenDown(guild, pMembers);
  await removedWhenDown(guild, pMembers);

  return true;
}

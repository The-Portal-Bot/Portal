import { BanOptions, Guild, GuildMember, Message, VoiceState } from 'discord.js';
import { PGuild } from '../types/classes/PGuild.class';
import { PMember } from '../types/classes/PMember.class';
import { Rank } from '../types/classes/PTypes.interface';
import { RankSpeed, RankSpeedValueList } from '../types/enums/RankSpeed.enum';
import { logger, timeElapsed } from './help.library';
import { updateEntireMember, updateMember } from './mongo.library';

export async function calculateRank(member: PMember): Promise<number> {
  if (member.tier === 0) {
    member.tier = 1; // must be removed
  }

  if (member.points >= member.tier * 2500) {
    member.points -= member.tier * 2500;
    member.level++;

    if (member.level % 5 === 0) {
      member.tier++;
    }
  }

  return member.level;
}

export async function addPointsTime(pMember: PMember, rankSpeed: number): Promise<number> {
  if (!pMember.timestamp) {
    return pMember.points;
  }

  const voiceTime = timeElapsed(pMember.timestamp, 0);

  pMember.points += Math.round(voiceTime.remainingSec * RankSpeedValueList[rankSpeed] * 0.5);
  pMember.points += Math.round(voiceTime.remainingMin * RankSpeedValueList[rankSpeed] * 30 * 1.15);
  pMember.points += Math.round(voiceTime.remainingHrs * RankSpeedValueList[rankSpeed] * 30 * 30 * 1.25);

  pMember.timestamp = null;

  return pMember.points;
}

export async function updateTimestamp(voiceState: VoiceState, pGuild: PGuild): Promise<number | boolean> {
  if (!voiceState.member || voiceState.member.user.bot) {
    return false;
  }

  const pMember = pGuild.pMembers.find((m) => voiceState && voiceState.member && m.id === voiceState.member.id);

  if (!pMember) {
    return false;
  }

  const ranks = pGuild.ranks;
  const member = voiceState.member;
  const speed = pGuild.rankSpeed;
  const cachedLevel = pMember.level;

  if (!pMember.timestamp) {
    pMember.timestamp = new Date();
    await updateMember(voiceState.guild.id, member.id, 'timestamp', pMember.timestamp) ? false : pMember.level;
  }

  pMember.points = await addPointsTime(pMember, speed);
  pMember.level = await calculateRank(pMember);
  pMember.timestamp = null;

  const updatedEntireMember = await updateEntireMember(voiceState.guild.id, member.id, pMember);

  if (!updatedEntireMember) {
    return false;
  }

  const roleRankUp = await giveRoleFromRankUp(pMember, member, ranks, voiceState.guild);

  if (!roleRankUp) {
    return false;
  }

  return pMember.level > cachedLevel ? pMember.level : false;
}

export async function addPointsMessage(message: Message, member: PMember, rankSpeed: number): Promise<number | boolean> {
  if (rankSpeed === RankSpeed.none) {
    return false;
  }

  if (!message.guild) {
    return false;
  }

  const points = message.content.length * RankSpeedValueList[rankSpeed];
  member.points += points > 5 ? 5 : points;

  updateMember(message.guild.id, member.id, 'points', member.points)
    .catch((e) => {
      return `failed to update member`;
    });

  const level = await calculateRank(member);

  if (level) {
    updateMember(message.guild.id, member.id, 'level', level)
      .catch((e) => {
        return `failed to update member`;
      });
  }

  return level ?? false;
}

export async function kick(memberToKick: GuildMember, kickReason: string): Promise<boolean> {
  if (!memberToKick.kickable) {
    return false;
  }

  return !!await memberToKick.kick(kickReason)
}

export async function ban(userToBan: GuildMember, banOptions: BanOptions): Promise<boolean> {
  if (!userToBan.bannable) {
    return false;
  }

  return !!await userToBan.ban(banOptions);
}

async function giveRoleFromRankUp(
  pMember: PMember,
  member: GuildMember,
  ranks: Rank[],
  guild: Guild
): Promise<boolean> {
  if (!ranks) {
    logger.error(new Error('At least one rank must be given'));
    return false;
  }

  const newRank = await ranks.find((rank) => rank.level === pMember.level);

  if (!newRank) {
    logger.error(new Error('Could not find rank'));
    return false;
  }

  const newRole = await guild.roles.cache.find((role) => role.id === newRank.role);

  if (!newRole) {
    logger.error(new Error('Could not find role'));
    return false;
  }

  try {
    await member.roles.add(newRole);
  } catch (e) {
    throw new Error(`failed to give role to member`);
  }

  return true;
}
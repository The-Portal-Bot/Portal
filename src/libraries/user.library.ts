import { BanOptions, Guild, GuildMember, Message, VoiceState } from 'discord.js';
import { RankSpeed, RankSpeedValueList } from '../types/enums/RankSpeed.enum';
import { PGuild } from '../types/classes/PGuild.class';
import { PMember } from '../types/classes/PMember.class';
import { Rank } from '../types/classes/PTypes.interface';
import { timeElapsed } from './help.library';
import { updateEntireMember, updateMember } from './mongo.library';

async function giveRoleFromRankUp(
  pMember: PMember,
  member: GuildMember,
  ranks: Rank[],
  guild: Guild
): Promise<boolean> {
  if (!ranks) {
    throw Error('At least one rank must be given');
  }

  const newRank = await ranks.find((r) => r.level === pMember.level);

  if (!newRank) {
    throw Error('Could not find rank.');
  }

  const newRole = await guild.roles.cache.find((role) => role.id === newRank.role);

  if (!newRole) {
    throw Error('Could not find role.');
  }

  try {
    await member.roles.add(newRole);
  } catch (e) {
    throw new Error(`failed to give role to member`);
    // log error
  }

  return true;
}

export function calculateRank(member: PMember): number {
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

export function addPointsTime(pMember: PMember, rankSpeed: number): number {
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

export function updateTimestamp(voiceState: VoiceState, pGuild: PGuild): Promise<number | boolean> {
  return new Promise((resolve, reject) => {
    if (voiceState.member && !voiceState.member.user.bot) {
      const pMember = pGuild.pMembers.find((m) => voiceState && voiceState.member && m.id === voiceState.member.id);

      if (!pMember) {
        return resolve(false);
      }

      const ranks = pGuild.ranks;
      const member = voiceState.member;
      const speed = pGuild.rankSpeed;
      const cachedLevel = pMember.level;

      if (!pMember.timestamp) {
        pMember.timestamp = new Date();
        updateMember(voiceState.guild.id, member.id, 'timestamp', pMember.timestamp)
          .then(() => {
            return resolve(false);
          })
          .catch((e) => {
            return reject(`failed to update member: ${e}`);
          });
      } else {
        pMember.points = addPointsTime(pMember, speed);
        pMember.level = calculateRank(pMember);
        pMember.timestamp = null;

        updateEntireMember(voiceState.guild.id, member.id, pMember)
          .then(() => {
            giveRoleFromRankUp(pMember, member, ranks, voiceState.guild)
              .then(() => {
                if (pMember.level > cachedLevel) {
                  return resolve(pMember.level);
                } else {
                  return resolve(false);
                }
              })
              .catch((e) => {
                return reject(`failed to give role: ${e}`);
              });
          })
          .catch((e) => {
            return reject(`failed to update member: ${e}`);
          });
      }
    } else {
      return resolve(false);
    }
  });
}

export function addPointsMessage(message: Message, member: PMember, rankSpeed: number): Promise<number | boolean> {
  return new Promise((resolve, reject) => {
    if (rankSpeed === RankSpeed.none) {
      return false;
    }

    if (!message.guild) {
      return false;
    }

    const points = message.content.length * RankSpeedValueList[rankSpeed];
    member.points += points > 5 ? 5 : points;

    updateMember(message.guild.id, member.id, 'points', member.points).catch((e) => {
      return reject(`failed to update member: ${e}`);
    });

    const level = calculateRank(member);

    if (level) {
      updateMember(message.guild.id, member.id, 'level', level).catch((e) => {
        return reject(`failed to update member: ${e}`);
      });
    }

    return level ? level : false;
  });
}

export function kick(memberToKick: GuildMember, kickReason: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (memberToKick.kickable) {
      memberToKick
        .kick(kickReason)
        .then(() => {
          return resolve(true);
        })
        .catch((e) => {
          return reject(e);
        });
    } else {
      return resolve(false);
    }
  });
}

export function ban(memberToBan: GuildMember, banOptions: BanOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (memberToBan.bannable) {
      memberToBan
        .ban(banOptions)
        .then(() => {
          return resolve(true);
        })
        .catch((e) => {
          return reject(e);
        });
    } else {
      return resolve(false);
    }
  });
}

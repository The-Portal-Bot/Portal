import { Document } from "mongoose";

export class GiveRole {
  public emote: string;
  public role: [string];

  constructor(
    emote: string,
    role: [string]
  ) {
    this.emote = emote;
    this.role = role;
  }
}

export class PGiveRole {
  public messageId: string;
  public roleEmoteMap: GiveRole[];

  constructor(
    messageId: string,
    roleEmoteMap: GiveRole[]
  ) {
    this.messageId = messageId;
    this.roleEmoteMap = roleEmoteMap;
  }
}

export interface IPGiveRole extends Document {
	messageId: string;
	roleEmoteMap: GiveRole[];
}

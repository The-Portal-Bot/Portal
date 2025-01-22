import type { Document } from "npm:mongoose";

export class PPoll {
  public messageId: string;
  public memberId: string;

  constructor(messageId: string, memberId: string) {
    this.messageId = messageId;
    this.memberId = memberId;
  }
}

export interface IPPoll extends Document {
  messageId: string;
  memberId: string;
}

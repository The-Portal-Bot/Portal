import { Document } from "mongoose";

export class PollPrtl {
	public message_id: string;
	public member_id: string;

	constructor(
		message_id: string,
		member_id: string
	) {
		this.message_id = message_id;
		this.member_id = member_id;
	}
}

export interface IPollPrtl extends Document {
	message_id: string;
	member_id: string;
}
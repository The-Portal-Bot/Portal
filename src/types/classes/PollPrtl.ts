export class PollPrtl {
	message_id: string;
	member_id: string;

	constructor(
		message_id: string,
		member_id: string
	) {
		this.message_id = message_id;
		this.member_id = member_id;
	}
}

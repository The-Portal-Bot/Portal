import { Document } from "mongoose";

export class MemberPrtl {
	public id: string;
	public level: number;
	public rank: number;
	public tier: number;
	public points: number;
	public timestamp: Date | null;
	public regex: string | null;

	constructor(
		id: string,
		level: number,
		rank: number,
		tier: number,
		points: number,
		timestamp: Date | null,
		regex: string | null
	) {
		this.id = id;
		this.level = level;
		this.rank = rank;
		this.tier = tier;
		this.points = points;
		this.timestamp = timestamp;
		this.regex = regex;
	}
};

export interface IMemberPrtl extends Document {
	id: string;
	level: number;
	rank: number;
	tier: number;
	points: number;
	timestamp: Date | null;
	regex: string | null;
}
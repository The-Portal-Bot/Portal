export class MemberPrtl {
	public level: number;
	public rank: number;
	public tier: number;
	public points: number;
	public timestamp: number;

	constructor(
		level: number,
		rank: number,
		tier: number,
		points: number,
		timestamp: number
	) {
		this.level = level;
		this.rank = rank;
		this.tier = tier;
		this.points = points;
		this.timestamp = timestamp;
	}
};
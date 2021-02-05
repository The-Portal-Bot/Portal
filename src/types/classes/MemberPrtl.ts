export class MemberPrtl {
	public id: string;
	public level: number;
	public rank: number;
	public tier: number;
	public points: number;
	public timestamp: Date | null;
	public dj: boolean;
	public admin: boolean;
	public ignored: boolean;
	public regex: string | null;

	constructor(
		id: string,
		level: number,
		rank: number,
		tier: number,
		points: number,
		timestamp: Date | null,
		dj: boolean,
		admin: boolean,
		ignored: boolean,
		regex: string | null
	) {
		this.id = id;
		this.level = level;
		this.rank = rank;
		this.tier = tier;
		this.points = points;
		this.timestamp = timestamp;
		this.dj = dj;
		this.admin = admin;
		this.ignored = ignored;
		this.regex = regex;
	}
};
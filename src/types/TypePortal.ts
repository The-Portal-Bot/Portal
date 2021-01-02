export class ObjectFunction {
	public name: string = '';
	public description: string = '';
	public super_description: string = '';
	public example: string = '';
	public args: string = '';
	public get!: any;
	public set!: any;
	public auth!: string;

	constructor(
		name: string,
		description: string,
		super_description: string,
		example: string,
		args: string,
		auth: string,
		get: any,
		set: any
	) {
		this.name = name;
		this.description = description;
		this.super_description = super_description;
		this.example = example;
		this.args = args;
		this.auth = auth;
		this.get = get;
		this.set = set;
	}
}
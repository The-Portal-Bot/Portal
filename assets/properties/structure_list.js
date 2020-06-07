module.exports =
{
	is_structure: function (arg) {
		for (i = 0; i < this.structures.length; i++) {
			if (String(arg).substring(1, (String(this.structures[i].name).length + 1)) == this.structures[i].name) {
				return this.structures[i].name;
			}
		}
		return false;
	},
	get_help: function () {
		let strc_array = [];
		for (i = 0; i < this.structures.length; i++) {
			strc_array.push({
				emote: this.structures[i].name,
				role: '**desc**: *' + this.structures[i].description + '*' +
					'\n**args**: *' + this.structures[i].args + '*',
				inline: true
			});
		}
		return create_rich_embed('Structures',
			'Prefix: ' + this.prefix + '\nCommands to access portal bot.' +
			'\n**!**: *mandatory*, **@**: *optional*',
			'#EEB902', strc_array);
	},
	get_help_super: function (check) {
		for (i = 0; i < this.structures.length; i++) {
			let strc = this.structures[i]
			if (strc.name === check) {
				return create_rich_embed(
					strc.name,
					'Type: Structure' +
					'\nPrefix: ' + this.prefix +
					'\n**!**: *mandatory*, **@**: *optional*',
					'#EEB902',
					[
						{ emote: 'Description', role: '*' + strc.super_description + '*', inline: false },
						{ emote: 'Arguments', role: '*' + strc.args + '*', inline: false }
					]
				)
			}
		}
		return false;
	},
	prefix: '{{',
	structures: [
		{
			name: 'if',
			description: 'if statement with two outcomes: {{\n\t"if": "John", "is": "===", "with": "John",\n\t' +
				'"yes": "same name", "no": "not the same name"\n}}',
			super_description: '**if**, gets two arguments, an operator and two outcomes and returns ' +
				'outcome a if statement is true and second if not.\n' +
				'example: ./run {{\n\t"if": "John", "is": "===", "with": "John",\n\t' +
				'"yes": "same name", "no": "not the same name"\n}}\n This will return *same name* as '+
				'it is the same name.\nOperator is can take values: ==, ===, !=, !==, >, <, >=, <=.\n'+
				'* You can read the statement as: if John is equal with John ? yes, same name or no, not same name.\n'+
				'* You cannot encapsulate if statements.',
			args: 'JSON with: if, is, with, yes, no'
		}
	]
}

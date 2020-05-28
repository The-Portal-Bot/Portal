module.exports =
{
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
				'You can read the statement as: if John is equal with John ? yes, same name or no, not same name.',
			args: 'JSON with: if, is, with, yes, no'
		}
	]
}

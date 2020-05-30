const voca = require('voca');

const vrbl_objct = require('./../assets/properties/variable_list');
const pipe_objct = require('./../assets/properties/pipe_list');
const attr_objct = require('./../assets/properties/attribute_list');

module.exports = {

	get_vrbl_data: function (variable, id, guild, portal_list) {
		for (i = 0; i < vrbl_objct.variables.length; i++)
			if (variable == vrbl_objct.variables[i].name)
				return vrbl_objct.variables[i].get(guild, id, portal_list);
	}
	,

	get_pipe_data: function (pipe, str, count) {
		for (i = 0; i < pipe_objct.pipes.length; i++)
			if (pipe == pipe_objct.pipes[i].name)
				return pipe_objct.pipes[i].get(str, count);
	}
	,

	get_attr_data: function (attr, id, portal_list, guild) {
		for (i = 0; i < attr_objct.attributes.length; i++)
			if (attr == attr_objct.attributes[i].name)
				return attr_objct.attributes[i].get(id, portal_list, guild);
	}
	,

	//

	is_variable: function (arg) {
		for (i = 0; i < vrbl_objct.variables.length; i++)
			if (String(arg).substring(1, (String(vrbl_objct.variables[i].name).length + 1)) == vrbl_objct.variables[i].name)
				return vrbl_objct.variables[i].name;
		return false;
	}
	,

	is_pipe: function (arg) {
		for (i = 0; i < pipe_objct.pipes.length; i++)
			if (String(arg).substring(1, (String(pipe_objct.pipes[i].name).length + 1))
				== pipe_objct.pipes[i].name)
				return pipe_objct.pipes[i].name;
		return false;
	}
	,

	is_attribute: function (arg) {
		for (i = 0; i < attr_objct.attributes.length; i++)
			if (String(arg).substring(1, (String(attr_objct.attributes[i].name).length + 1))
				== attr_objct.attributes[i].name)
				return attr_objct.attributes[i].name;
		return false;
	}
	,

	if_expression_check: function (arg) {
		if (String(arg).substring(0, 1) == '{') {
			console.log('expression: ' + String(arg).substring(1,
				String(arg).indexOf('?')));
			console.log('statemment1: ' + String(arg).substring(
				String(arg).indexOf('?') + 1, String(arg).indexOf(':')));
			console.log('statemment2: ' + String(arg).substring(
				String(arg).indexOf(':') + 1, String(arg).indexOf('}')));
		}
		return false;
	}
	,

	//

	regex_interpreter: function (regex, id, guild, portal_list) {
		if (regex === undefined) { return "regex is undefined"; }
		if (id === undefined) { return "id is undefined"; }
		if (guild === undefined) { return "guild is undefined"; }
		if (portal_list === undefined) { return "portal_list is undefined"; }

		let inline = {
			"==": (a, b) => { if (a == b) return true; else false; },
			"===": (a, b) => { if (a === b) return true; else false; },
			"!=": (a, b) => { if (a != b) return true; else false; },
			"!==": (a, b) => { if (a !== b) return true; else false; },
			">": (a, b) => { if (a > b) return true; else false; },
			"<": (a, b) => { if (a < b) return true; else false; },
			">=": (a, b) => { if (a >= b) return true; else false; },
			"<=": (a, b) => { if (a <= b) return true; else false; }
		};
		let last_space_index = 0;
		let last_vatiable_end_index = 0;
		let last_attribute_end_index = 0;

		let last_variable = '';
		let last_attribute = '';

		let new_channel_name = '';

		for (let i = 0; i < regex.length; i++) {
			console.log('regex[' + (i+1) + '] = ' + regex[i]);
			
			if (regex[i] === '$') {
				let vrbl = this.is_variable(regex.substring(i));
				if (vrbl) {
					last_variable = this.get_vrbl_data(vrbl, id, guild, portal_list);
					new_channel_name += last_variable;
					i += voca.chars(vrbl).length;
					last_vatiable_end_index = i;
				} else {
					new_channel_name += regex[i];
				}
			} else if (regex[i] === '|') {
				let pipe = this.is_pipe(regex.substring(i));
				let cnt = regex.substring(i + 5, i + 6); // wtf wrong ? check ?

				if (pipe) {
					console.log('1) ' + (last_vatiable_end_index + 1) + ' === ' + i)
					console.log('2) ' + (last_attribute_end_index + 1) + ' === ' + i)
					console.log('3) ' + (last_space_index + 1) + ' === ' + i)
					if (last_vatiable_end_index + 1 === i) { console.log('inside: 1')
						// removes previous variable output, in order to replace with pipe output
						new_channel_name = new_channel_name.substring(0,
							voca.chars(new_channel_name).length - voca.chars(last_variable).length);
						new_channel_name += this.get_pipe_data(pipe, last_variable, cnt);
						i += voca.chars(pipe).length;
					} else if (last_attribute_end_index + 1 === i) { console.log('inside: 2')
						// removes previous variable output, in order to replace with pipe output
						new_channel_name = new_channel_name.substring(0,
							voca.chars(new_channel_name).length - voca.chars(last_attribute).length);
						new_channel_name += this.get_pipe_data(pipe, last_attribute, cnt);
						i += voca.chars(pipe).length;
					} else { console.log('inside: 3')
						console.log('str=' + new_channel_name.substring(
							last_space_index,
							new_channel_name.length));
						let str_for_pipe = this.get_pipe_data(pipe, new_channel_name.substring(
							last_space_index,
							new_channel_name.length), cnt);
						new_channel_name = new_channel_name.substring(0, last_space_index);
						new_channel_name += str_for_pipe;
						i += voca.chars(pipe).length;
					}
					if (pipe === 'word') i++;
				} else {
					new_channel_name += regex[i];
				}
			} else if (regex[i] === '@') {
				let attr = this.is_attribute(regex.substring(i));

				if (attr) {
					last_attribute = this.get_attr_data(attr, id, portal_list, guild);
					new_channel_name += last_attribute;
					i += voca.chars(attr).length;
					last_attribute_end_index = i;
				} else {
					new_channel_name += regex[i];
				}
			} else if (regex[i] === '{' && (regex[i + 1] !== undefined && regex[i + 1] === '{')) {
				try {
					// did not put into structure_list due to many unnecessary function calls
					let statement = JSON.parse(regex.substring(i + 1, i + 1 + regex.substring(i + 1).indexOf('}}') + 1));
					if (inline[statement.is](
						this.regex_interpreter(statement.if, id, guild, portal_list),
						this.regex_interpreter(statement.with, id, guild, portal_list)
					)) {
						let value = this.regex_interpreter(statement.yes, id, guild, portal_list);
						console.log('value_a: ' + value)
						if ('--' !== value)
							new_channel_name += value;
					} else {
						let value = this.regex_interpreter(statement.no, id, guild, portal_list);
						console.log('value_b: ' + value)
						if ('--' !== value)
							new_channel_name += value;
					}
					i += regex.substring(i + 1).indexOf('}}') + 2;
				} catch (error) {
					console.log('Error: in JSON parse: ', error);
					new_channel_name += regex[i];
				}
			} else {
				new_channel_name += regex[i];
				if (regex[i] === ' ') {
					last_space_index = i + 1;
					console.log('new space is: ' + last_space_index);
				}
			}
		}
		if (new_channel_name === '')
			return '.';
		else
			return new_channel_name;
	}

};

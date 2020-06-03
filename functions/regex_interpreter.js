const voca = require('voca');

const vrbl_objct = require('./../assets/properties/variable_list');
const pipe_objct = require('./../assets/properties/pipe_list');
const attr_objct = require('./../assets/properties/attribute_list');

module.exports =
{
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

	//

	regex_interpreter: function (regex, voice_channel, voice_object, portal_object) {
		if (regex === undefined) { return "regex is undefined"; }
		if (voice_channel === undefined) { return "voice_channel is undefined"; }
		if (voice_object === undefined) { return "voice_object is undefined"; }
		if (portal_object === undefined) { return "portal_object is undefined"; }

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
			
			if (regex[i] === vrbl_objct.prefix) {

				if (vrbl = this.is_variable(regex.substring(i))) {
					if (return_value = vrbl_objct.get(voice_channel, voice_object, portal_object, vrbl)) {
						last_variable = return_value;
						new_channel_name += return_value;
						i += voca.chars(vrbl).length;
						last_vatiable_end_index = i;
					} else {
						new_channel_name += regex[i];
					}
				} else {
					new_channel_name += regex[i];
				}

			} else if (regex[i] === attr_objct.prefix) {

				if (attr = this.is_attribute(regex.substring(i))) {
					if (return_value = attr_objct.get(voice_channel, voice_object, portal_object, attr)) {
						last_attribute = return_value;
						new_channel_name += return_value;
						i += voca.chars(attr).length;
						last_attribute_end_index = i;
					} else {
						new_channel_name += regex[i];
					}
				} else {
					new_channel_name += regex[i];
				}

			} else if (regex[i] === pipe_objct.prefix) {

				if (pipe = this.is_pipe(regex.substring(i))) {

					if (last_vatiable_end_index + 1 === i) {

						if (return_value = pipe_objct.get(last_variable, pipe
						)) {
							new_channel_name = new_channel_name.substring(0,
								voca.chars(new_channel_name).length - voca.chars(last_variable).length);
							new_channel_name += return_value;
							i += voca.chars(pipe).length;
						} else {
							new_channel_name += regex[i];
						}

					} else if (last_attribute_end_index + 1 === i) {
						
						if (return_value = pipe_objct.get(last_attribute, pipe
						)) {
							new_channel_name = new_channel_name.substring(0,
								voca.chars(new_channel_name).length - voca.chars(last_attribute).length);
							new_channel_name += return_value;
							i += voca.chars(pipe).length;
						} else {
							new_channel_name += regex[i];
						}

					} else {

						if (return_value = pipe_objct.get(
							new_channel_name.substring( last_space_index, new_channel_name.length), pipe
						)) {
							let str_for_pipe = return_value
							new_channel_name = new_channel_name.substring(0, last_space_index);
							new_channel_name += str_for_pipe;
							i += voca.chars(pipe).length;
						} else {
							new_channel_name += regex[i];
						}

					}
		
				} else {
					new_channel_name += regex[i];
				}

			} else if (regex[i] === '{' && (regex[i + 1] !== undefined && regex[i + 1] === '{')) {
				try {
					// did not put into structure_list due to many unnecessary function calls
					let statement = JSON.parse(regex.substring(i + 1, i + 1 + regex.substring(i + 1).indexOf('}}') + 1));
					if (inline[statement.is](
						this.regex_interpreter(statement.if, voice_channel, voice_object, portal_object),
						this.regex_interpreter(statement.with, voice_channel, voice_object, portal_object)
					)) {
						let value = this.regex_interpreter(statement.yes, voice_channel, voice_object, portal_object);
						if ('--' !== value)
							new_channel_name += value;
					} else {
						let value = this.regex_interpreter(statement.no, voice_channel, voice_object, portal_object);
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
				}
			}
		}
		
		if (new_channel_name === '')
			return '.';
		else
			return new_channel_name;
	}

};

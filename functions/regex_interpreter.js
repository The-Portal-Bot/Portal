const voca = require('voca');

const vrbl_objct = require('./../assets/properties/variable_list');
const pipe_objct = require('./../assets/properties/pipe_list');
const attr_objct = require('./../assets/properties/attribute_list');

module.exports =
{
	regex_interpreter: function (regex, voice_channel, voice_object, portal_object) {

		let last_space_index = 0;
		let last_vatiable_end_index = 0;
		let last_attribute_end_index = 0;

		let last_variable = '';
		let last_attribute = '';

		let new_channel_name = '';

		for (let i = 0; i < regex.length; i++) {
			
			if (regex[i] === vrbl_objct.prefix) {
				if (vrbl = vrbl_objct.is_variable(regex.substring(i))) {
					if (return_value = vrbl_objct.get(voice_channel, voice_object, portal_object, vrbl)) {
						last_variable = return_value;
						new_channel_name += return_value;
						i += voca.chars(vrbl).length;
						last_vatiable_end_index = i;
					} else { new_channel_name += regex[i]; }
				} else { new_channel_name += regex[i]; }

			} else if (regex[i] === attr_objct.prefix) {

				if (attr = attr_objct.is_attribute(regex.substring(i))) {
					if (return_value = attr_objct.get(voice_channel, voice_object, portal_object, attr)) {
						last_attribute = return_value;
						new_channel_name += return_value;
						i += voca.chars(attr).length;
						last_attribute_end_index = i;
					} else { new_channel_name += regex[i]; }
				} else { new_channel_name += regex[i]; }

			} else if (regex[i] === pipe_objct.prefix) {

				if (pipe = pipe_objct.is_pipe(regex.substring(i))) {
					if (last_vatiable_end_index + 1 === i) {
						if (return_value = pipe_objct.get(last_variable, pipe)) {
							new_channel_name = new_channel_name.substring(0,
								voca.chars(new_channel_name).length - voca.chars(last_variable).length);
							new_channel_name += return_value;
							i += voca.chars(pipe).length;
						} else { new_channel_name += regex[i]; }
					} else if (last_attribute_end_index + 1 === i) {
						if (return_value = pipe_objct.get(last_attribute, pipe)) {
							new_channel_name = new_channel_name.substring(0,
								voca.chars(new_channel_name).length - voca.chars(last_attribute).length);
							new_channel_name += return_value;
							i += voca.chars(pipe).length;
						} else { new_channel_name += regex[i]; }
					} else {
						if (return_value = pipe_objct.get(
							new_channel_name.substring(last_space_index, new_channel_name.length), pipe)) {
							let str_for_pipe = return_value
							new_channel_name = new_channel_name.substring(0, last_space_index);
							new_channel_name += str_for_pipe;
							i += voca.chars(pipe).length;
						} else { new_channel_name += regex[i]; }
					}
				} else {
					new_channel_name += regex[i];
				}

			} else if (regex[i] === '{' && (regex[i + 1] !== undefined && regex[i + 1] === '{')) {
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
		
		if (new_channel_name === '') {
			return '.';
		} else {
			return new_channel_name;
		}
	}

};

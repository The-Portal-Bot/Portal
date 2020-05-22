const vrbl_objct = require('./../assets/properties/variable_list');
const pipe_objct = require('./../assets/properties/pipe_list');
const attr_objct = require('./../assets/properties/attribute_list');

module.exports = {

	get_vrbl_data: function (variable, id, guild, portal_list) {
		console.log('vrbl_objct.variables.length = ' + vrbl_objct.variables.length);
		for (i = 0; i < vrbl_objct.variables.length; i++) {
			console.log(variable + ' === ' + vrbl_objct.variables[i].name);
			if (variable == vrbl_objct.variables[i].name) {
				console.log('einai ontos');
				return vrbl_objct.variables[i].get(guild, id, portal_list);
			}
		}
	}
	,

	get_pipe_data: function (pipe, str, count) {
		for (i = 0; i < pipe_objct.pipes.length; i++)
			if (pipe == pipe_objct.pipes[i].name)
				return pipe_objct.pipes[i].get(str, count);
	}
	,

	get_attr_data: function (attr, id, portal_list) {
		for (i = 0; i < attr_objct.attributes.length; i++)
			if (attr == attr_objct.attributes[i].name)
				return attr_objct.attributes[i].get(id, portal_list);
	}
	,

	//

	is_variable: function (arg) {
		console.log('vrbl_objct.variables.length = ' + vrbl_objct.variables.length);
		for (i = 0; i < vrbl_objct.variables.length; i++) {
			console.log(String(arg).substring(1, (String(vrbl_objct.variables[i].name).length + 1)) + ' === ' + vrbl_objct.variables[i].name);
			if (String(arg).substring(1, (String(vrbl_objct.variables[i].name).length + 1)) == vrbl_objct.variables[i].name) {
				return vrbl_objct.variables[i].name;
			}
		}
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

		let new_channel_objct = '';
		let last_variable = '';

		for (let i = 0; i < regex.length; i++) {
			if (regex[i] === '$') {
				console.log('einai $');
				let vrbl = this.is_variable(regex.substring(i));
				console.log('vrbl =' + vrbl);
				if (vrbl) {
					new_channel_objct += this.get_vrbl_data(vrbl, id, guild, portal_list);
					last_variable = new_channel_objct;
					i += vrbl.length;
				} else {
					console.log('den einai mpainei opos einai');
					new_channel_objct += regex[i];
				}
			} else if (regex[i] === '|') {
				let pipe = this.is_pipe(regex.substring(i));
				let cnt = regex.substring(i + 5, i + 6);
				
				if (pipe) {
					// removes previous variable output, in order to replace with pipe output
					new_channel_objct = new_channel_objct.nnel.substring(
						0, new_channel_objct.nnel.length - last_variable.length
					);
					new_channel_objct += this.get_pipe_data(pipe, last_variable, cnt);
					i += pipe.length;
				} else {
					new_channel_objct += regex[i];
				}
			} else if (regex[i] === '@') {
				let attr = this.is_attribute(regex.substring(i));

				if (attr) {
					new_channel_objct += this.attr_data(attr, id, portal_list);
					i += attributes.length;
				} else {
					new_channel_objct += regex[i];
				}
			} else {
				new_channel_objct += regex[i];
			}
		}
		return new_channel_objct;
	}

};

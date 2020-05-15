const object = require('./object_retrievers.js');

module.exports = {
	// variables $
	vrbl_name: [
		{
			value: '#', func: (guild, id, portal_list) => {
				let voice_number = undefined;
				portal_list.forEach(portal => {
					portal.voice_list.forEach((voice, key) => {
						if (voice.id === id) {
							voice_number = key + 1;
						}
					})
				})
				return voice_number;
			}
		},
		{
			value: '##', func: (guild, id, portal_list) => {
				let portal_number = undefined;
				portal_list.forEach((portal, key) => {
					if (portal.id === id) {
						portal_number = key + 1;
					}
				})
				return portal_number;
			}
		},
		{ value: 'date', func: () => { let date = new Date(); return date; } },
		{ value: 'tday', func: () => { let date = new Date(); return date.getDate(); } },
		{ value: 'nday', func: () => { let date = new Date(); return date.getDay(); } },
		{ value: 'mnth', func: () => { let date = new Date(); return date.getMonth(); } },
		{ value: 'year', func: () => { let date = new Date(); return date.getFullYear(); } },
		{ value: 'time', func: () => { let date = new Date(); return date.getTime(); } },
		{ value: 'hour', func: () => { let date = new Date(); return date.getHours(); } },
		{ value: 'mint', func: () => { let date = new Date(); return date.getMinutes(); } },
		{ value: 'scnd', func: () => { let date = new Date(); return date.getSeconds(); } },
		{
			value: 'crtr', func: (guild, id, portal_list) => {
				portal_list.forEach(portal => {
					portal.voice_list.forEach(voice => {
						if (voice.id === id) {
							return voice.creator;
						}
					})
				})
			}
		},
		{
			value: 'status_lst', func: (guild, id) => { return object.get_status_list(guild, id) }
		},
		{
			value: 'status_cnt', func: (guild, id) => { //check if he is in a voice channel of a portal 
				if (typeof (object.get_status_list(guild, id)) !== "object") { return 0; }
				else { object.get_status_list(guild, id).length; }
			}
		},
		{ value: 'status_his', func: () => { return "no_yet_implemented" } },
		{
			value: 'mmbr_lst', func: (guild, id) => {
				let mmbr_lst = [];
				guild.channels.forEach(channel => {
					if (channel.id === id) {
						channel.members.forEach(member => {
							mmbr_lst.push(member);
						})
					}
				})
				return mmbr_lst;
			}
		},
		{
			value: 'mmbr_cnt', func: (guild, id) => {
				let cnt = undefined;
				guild.channels.forEach(channel => {
					if (channel.id === id) {
						cnt = channel.members.size;
					}
				})
				return cnt;
			}
		},
		{
			value: 'mmbr_plg', func: (guild, id) => {
				let cnt = 0;
				guild.channels.forEach(channel => {
					if (channel.id === id) {
						channel.members.forEach((member) => {
							if (member.presence.game !== null) {
								cnt++;
							}
						})
					}
				})
				return cnt;
			}
		},
		{ value: 'mmbr_his', func: () => { return "no_yet_implemented" } },
		{
			value: 'mmbr_lmt', func: (guild, id) => {
				let cnt = undefined;
				guild.channels.forEach(channel => {
					if (channel.id === id) {
						//console.log("Object.getOwnPropertyNames(channel)= ", Object.getOwnPropertyNames(channel));
						cnt = channel.userLimit; //change
					}
				})
				return cnt;
			}
		},
	],

	// pipes |
	pipe_name: [
		{
			value: 'upper', func: (str, count) => {
				return str.toUpperCase();
			}
		},
		{
			value: 'lower', func: (str, count) => {
				return str.toLowerCase();
			}
		},
		{
			value: 'titl', func: (str, count) => {
				str = str.toLowerCase().split(' ');
				for (let i = 0; i < str.length; i++)
					str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
				return str.join(' ');
			}
		},
		{
			value: 'acrnm', func: (str, count) => {
				let words = str.split(" ");
				let acr = words.map(word => { return word[0] });
				return acr.join("").toUpperCase();
			}
		},
		{
			value: 'word', func: (str, count) => {
				let count_words = '', words = str.split(" ");
				for (let i = 0; i < Number(count); i++)
					count_words += words[i];
				return count_words;
			}
		},
		{
			value: 'ppls_cnt', func: (str, count) => {
				let words = str.split(" "), mf = 1, m = 0, item = words[0];
				for (let i = 0; i < words.length; i++) {
					for (let j = i; j < words.length; j++) {
						if (words[i] == words[j]) { m++; }
						if (mf < m) { mf = m; item = words[i]; }
					}
					m = 0;
				}
				return mf;
			}
		},
		{
			value: 'ppls', func: (str, count) => {
				let words = str.split(" "), mf = 1, m = 0, item = words[0];
				for (let i = 0; i < words.length; i++) {
					for (let j = i; j < words.length; j++) {
						if (words[i] == words[j]) { m++; } 
						if (mf < m) { mf = m; item = words[i]; }
					}
					m = 0; 
				}
				return item;
			}
		},
		{ 
			value: 'smmr_cnt', func: (str, count) => { 
				return str.split(" ").length 
			} 
		},
	],

	// attributes @
	attr_name: [
		{
			value: 'no_bots', func: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].get_voice_list().length; j++)
						if (id === portal_list[i].get_voice_list()[j].id)
							return portal_list[i].get_voice_list()[j].get_no_bots;
			}
		},
		{
			value: 'mmbr_cap', func: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].get_voice_list().length; j++)
						if (id === portal_list[i].get_voice_list()[j].id)
							return portal_list[i].get_voice_list()[j].get_mmbr_cap();
			}
		},
		{
			value: 'time_to_live', func: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].get_voice_list().length; j++)
						if (id === portal_list[i].get_voice_list()[j].id)
							return portal_list[i].get_voice_list()[j].get_time_to_live();
			}
		},
		{
			value: 'refresh_rate', func: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].get_voice_list().length; j++)
						if (id === portal_list[i].get_voice_list()[j].id)
							return portal_list[i].get_voice_list()[j].get_refresh_rate();
			}
		},
		{
			value: 'count', func: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].get_voice_list().length; j++)
						if (id === portal_list[i].get_voice_list()[j].id)
							return portal_list[i].get_voice_list()[j].get_count();
			}
		},
	],

	//

	get_vrbl_data: function (variable, id, guild, portal_list) {
		for (i = 0; i < this.vrbl_name.length; i++)
			if (variable == this.vrbl_name[i].value)
				return this.vrbl_name[i].func(guild, id, portal_list);
	}
	,

	get_pipe_data: function (pipe, str, count) {
		for (i = 0; i < this.pipe_name.length; i++)
			if (pipe == this.pipe_name[i].value)
				return this.pipe_name[i].func(str, count);
	}
	,

	get_attr_data: function (attr, id, portal_list) {
		for (i = 0; i < this.attr_name.length; i++)
			if (attr == this.attr_name[i].value)
				return this.attr_name[i].func(id, portal_list);
	}
	,

	//

	is_variable: function (arg) {
		for (i = 0; i < this.vrbl_name.length; i++)
			if (String(arg).substring(1, (String(this.vrbl_name[i].value).length + 1)) == this.vrbl_name[i].value)
				return this.vrbl_name[i].value;
		return false;
	}
	,

	is_pipe: function (arg) {
		for (i = 0; i < this.pipe_name.length; i++)
			if (String(arg).substring(1, (String(this.pipe_name[i].value).length + 1)) == this.pipe_name[i].value)
				return this.pipe_name[i].value;
		return false;
	}
	,

	is_attribute: function (arg) {
		for (i = 0; i < this.attr_name.length; i++)
			if (String(arg).substring(1, (String(this.attr_name[i].value).length + 1)) == this.attr_name[i].value)
				return this.attr_name[i].value;
		return false;
	}
	,

	if_expression_check: function (arg) {
		if (String(arg).substring(0, 1) == '{') {
			console.log('expression: ' + String(arg).substring(1, String(arg).indexOf('?')));
			console.log('statemment1: ' + String(arg).substring(String(arg).indexOf('?') + 1, String(arg).indexOf(':')));
			console.log('statemment2: ' + String(arg).substring(String(arg).indexOf(':') + 1, String(arg).indexOf('}')));
		}
		return false;
	}
	,




	regex_interpreter: function (regex, id, guild, portal_list) {
		if (regex === undefined) { return "regex is undefined"; }
		if (id === undefined) { return "id is undefined"; }
		if (guild === undefined) { return "guild is undefined"; }

		let new_channel_name = ''
		let last_variable = ''

		for (let i = 0; i < regex.length; i++) {
			if (regex[i] === '$') {
				let vrbl = this.is_variable(regex.substring(i));

				if (vrbl) {
					new_channel_name += this.get_vrbl_data(vrbl, id, guild, portal_list);
					last_variable = new_channel_name;
					i += vrbl.length;
				} else {
					new_channel_name += regex[i];
				}
			} else if (regex[i] === '|') {
				let pipe = this.is_pipe(regex.substring(i));
				let cnt = regex.substring(i + 5, i + 6);
				
				if (pipe) {
					// removes previous variable output, in order to replace with pipe output
					new_channel_name = new_channel_name.substring(
						0, new_channel_name.length - last_variable.length
					);
					new_channel_name += this.get_pipe_data(pipe, last_variable, cnt);
					i += pipe.length;
				} else {
					new_channel_name += regex[i];
				}
			} else if (regex[i] === '@') {
				let attr = this.is_attribute(regex.substring(i));

				if (attr) {
					new_channel_name += this.get_attr_data(attr, id, portal_list);
					i += attr.length;
				} else {
					new_channel_name += regex[i];
				}
			} else {
				new_channel_name += regex[i];
			}
		}
		return new_channel_name;
	}
	,

	generate_channel_names: function (guild, portal_list) {
		let array_of_games = [];

		guild.channels.forEach(channel => {
			for (i = 0; i < portal_list.length; i++)
				for (j = 0; j < portal_list[i].get_voice_list().length; j++)
					if (channel.id === portal_list[i].get_voice_list()[j].id) {
						channel.setName(this.regex_interpreter(
							portal_list[i].regex_voice,
							portal_list[i].get_voice_list()[j].id,
							guild,
							portal_list
						));
						return
					}
		})
	}

};

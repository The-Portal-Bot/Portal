const object = require('./object_retrievers.js');
const moment = require('moment'); 
var v = require('voca');

module.exports = {

	// variables $
	vrbl_name: [
		{
			value: '#', get: (guild, id, portal_list) => {
				let voice_number = undefined;
				portal_list.forEach(portal => {
					portal.voice_list.forEach((voice, key) => {
						if (voice.id === id) voice_number = key + 1;
					})
				})
				return voice_number;
			}
		},
		{
			value: '##', get: (guild, id, portal_list) => {
				return portal_list.some((portal, key) => {
					if (portal.id === id) return key;
				})
			}
		},
		{ value: 'date', get: () => { return moment().locale("gr").subtract(10, 'days').calendar(); } },
		{ value: 'tday', get: () => { return moment().locale("gr").format('dddd'); } },
		{ value: 'nday', get: () => { return moment().locale("gr").format('dddd'); } },
		{ value: 'mnth', get: () => { return moment().locale("gr").format('mmmm'); } },
		{ value: 'year', get: () => { return moment().locale("gr").format('yyyy'); } },
		{ value: 'time', get: () => { return moment().locale("gr").format('h:mm:ss'); } },
		{ value: 'hour', get: () => { return moment().locale("gr").format('h'); } },
		{ value: 'mint', get: () => { return moment().locale("gr").format('mm'); } },
		{ value: 'scnd', get: () => { return moment().locale("gr").format('ss'); } },
		{
			value: 'crtr', get: (guild, id, portal_list) => {
				portal_list.forEach(portal => {
					portal.voice_list.forEach(voice => {
						if (voice.id === id) return voice.creator;
					})
				})
			}
		},
		{
			value: 'status_lst', get: (guild, id, portal_list) => { return object.get_status_list(guild, id, portal_list) }
		},
		{
			value: 'status_cnt', get: (guild, id) => { //check if he is in a voice channel of a portal 
				if (typeof (object.get_status_list(guild, id)) !== "object") { return 0; }
				else { object.get_status_list(guild, id).length; }
			}
		},
		{ value: 'status_his', get: () => { return "no_yet_implemented" } },
		{
			value: 'mmbr_lst', get: (guild, id) => {
				let mmbr_lst = [];
				guild.channels.forEach(channel => {
					if (channel.id === id)
						channel.members.forEach(member => {
							mmbr_lst.push(member);
						});
				});
				return mmbr_lst;
			}
		},
		{
			value: 'mmbr_cnt', get: (guild, id) => {
				let cnt = undefined;
				guild.channels.forEach(channel => {
					if (channel.id === id) cnt = channel.members.size;
				})
				return cnt;
			}
		},
		{
			value: 'mmbr_plg', get: (guild, id) => {
				let cnt = 0;
				guild.channels.forEach(channel => {
					if (channel.id === id)
						channel.members.forEach((member) => {
							if (member.presence.game !== null) cnt++;
						})
				})
				return cnt;
			}
		},
		{ value: 'mmbr_his', get: () => { return "no_yet_implemented" } },
		{
			value: 'mmbr_lmt', get: (guild, id) => {
				let cnt = undefined;
				guild.channels.forEach(channel => {
					if (channel.id === id) cnt = channel.userLimit;
				})
				return cnt;
			}
		},
	],

	// pipes |
	pipe_name: [
		{ value: 'upperCase', get: (str, count) => { return vocal.upperCase(str); } },
		{ value: 'lowerCase', get: (str, count) => { return vocal.lowerCase(str); } },
		{ value: 'capitalize', get: (str, count) => { return vocal.capitalize(str); } },
		{ value: 'decapitalize', get: (str, count) => { return vocal.decapitalize(str); } },
		{ value: 'kebabCase', get: (str, count) => { return vocal.kebabCase(str); } },
		{ value: 'snakeCase', get: (str, count) => { return vocal.snakeCase(str); } },
		{ value: 'titleCase', get: (str, count) => { return vocal.titleCase(str); } },
		{ value: 'camelCase', get: (str, count) => { return vocal.camelCase(str); } },
		{ value: 'acronym', get: (str, count) => { return vocal.chain(str).upperCase().words().first().value(); } },
		{ value: 'word', get: (str, count) => { return vocal.words(str).slice(0, count); } },
		{
			value: 'ppls_cnt', get: (str, count) => {
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
			value: 'ppls', get: (str, count) => {
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
			value: 'smmr_cnt', get: (str, count) => { 
				return str.split(" ").length 
			} 
		},
	],

	// attributes @
	attr_name: [
		{
			value: 'no_bots', get: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].no_bots;
			}
		},
		{
			value: 'mmbr_cap', get: (value, id, portal_list) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].mmbr_cap;
			}
		},
		{
			value: 'time_to_live', get: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].time_to_live;
			}
		},
		{
			value: 'refresh_rate', get: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].refresh_rate;
			}
		},
		{
			value: 'locale', get: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].locale;
			}
		},
		{
			value: 'count', get: (value, id, portal_listn) => {
				for (i = 0; i < portal_list.length; i++)
					for (j = 0; j < portal_list[i].voice_list.length; j++)
						if (id === portal_list[i].voice_list[j].id)
							return portal_list[i].voice_list[j].count();
			}
		},
	],

	//

	get_vrbl_data: function (variable, id, guild, portal_list) {
		for (i = 0; i < this.vrbl_name.length; i++)
			if (variable == this.vrbl_name[i].value)
				return this.vrbl_name[i].get(guild, id, portal_list);
	}
	,

	get_pipe_data: function (pipe, str, count) {
		for (i = 0; i < this.pipe_name.length; i++)
			if (pipe == this.pipe_name[i].value)
				return this.pipe_name[i].get(str, count);
	}
	,

	get_attr_data: function (attr, id, portal_list) {
		for (i = 0; i < this.attr_name.length; i++)
			if (attr == this.attr_name[i].value)
				return this.attr_name[i].get(id, portal_list);
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
			if (String(arg).substring(1, (String(this.pipe_name[i].value).length + 1)) 
				== this.pipe_name[i].value)
				return this.pipe_name[i].value;
		return false;
	}
	,

	is_attribute: function (arg) {
		for (i = 0; i < this.attr_name.length; i++)
			if (String(arg).substring(1, (String(this.attr_name[i].value).length + 1)) 
				== this.attr_name[i].value)
				return this.attr_name[i].value;
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
					new_channel_name += this.attr_data(attr, id, portal_list);
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

};

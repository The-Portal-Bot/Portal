const object = require('./object_retrievers.js');

module.exports = {
	// variables $
	vrbl_name: [ 
		{value: '#', func: (guild, id) => {
			guild.channels.forEach(channel => {
				if(channel.id === id) {
					return channel.members.length;
				}
			})
		}},

		{value: 'date', func: () => { let date = new Date(); return date; }},
		{value: 'tday', func: () => { let date = new Date(); return date.getDate(); }},
		{value: 'nday', func: () => { let date = new Date(); return date.getDay();  }},
		{value: 'mnth', func: () => { let date = new Date(); return date.getMonth();  }},
		{value: 'year', func: () => { let date = new Date(); return date.getFullYear();  }},
		{value: 'time', func: () => { let date = new Date(); return date.getTime();  }},
		{value: 'hour', func: () => { let date = new Date(); return date.getHours();  }},
		{value: 'mint', func: () => { let date = new Date(); return date.getMinutes();  }},
		{value: 'scnd', func: () => { let date = new Date(); return date.getSeconds();  }},

		{value: 'crtr', func: () => { return "no_yet_implemented" }},

		{value: 'game_lst', func: (guild, id) => { return object.get_status_list(guild, id)}},
		{value: 'game_cnt', func: (guild, id) => { //check if he is in a voice channel of a portal 
			if(typeof(object.get_status_list(guild, id)) !== "object") {return 0}
			else {object.get_status_list(guild, id).length}
		}},
		{value: 'game_his', func: () => { return "no_yet_implemented" }},
		{value: 'mmbr_lst', func: (guild, id) => { 
			let mmbr_lst = [];
			guild.channels.forEach(channel => {
				if(channel.id === id) {
					channel.members.forEach(member => {
						mmbr_lst.push(member);
					})
				}
			})
			return mmbr_lst;
		 }},
		{value: 'mmbr_cnt', func: (guild, id) => { 
			let cnt = undefined;
			guild.channels.forEach(channel => {
				if(channel.id === id) {
					cnt = channel.members.size;
				}
			})
			return cnt;
		 }},
		{value: 'mmbr_plg', func: () => { return "no_yet_implemented" }},
		{value: 'mmbr_his', func: () => { return "no_yet_implemented" }},
		{value: 'mmbr_lmt', func: () => { return "no_yet_implemented" }},
	],

	
	// pipes |
	pipe_name: [ 
		{value: 'upper', func: () => { return "no_yet_implemented" }},
		{value: 'lower', func: () => { return "no_yet_implemented" }},
		{value: 'titl', func: () => { return "no_yet_implemented" }},
		{value: 'acrnm', func: () => { return "no_yet_implemented" }},
		{value: 'word#', func: () => { return "no_yet_implemented" }},
		{value: 'ppls', func: () => { return "no_yet_implemented" }},
		{value: 'ppls_cnt', func: () => { return "no_yet_implemented" }},
		{value: 'smmr_cnt', func: () => { return "no_yet_implemented" }},
	],

	
	// attributes @
	attr_name: [
		{value: 'nbot', func: () => { return "no_yet_implemented" }},
		{value: 'mmbr_cap', func: () => { return "no_yet_implemented" }},
		{value: 'time_tolv', func: () => { return "no_yet_implemented" }},
		{value: 'titl_rfsh', func: () => { return "no_yet_implemented" }},
	],

	
	//
	get_variable_data: function(variable, id, guild)
	{
		for(i=0; i < this.vrbl_name.length; i++)
		{
			if(variable == this.vrbl_name[i].value)
			{
				return this.vrbl_name[i].func(guild, id);
			}
		} 
	}
	,

	is_variable: function(arg)
	{
		for(i=0, vrbl=this.vrbl_name[i].value; i < this.vrbl_name.length; i++, vrbl=this.vrbl_name[i].value)
		{
			if(String(arg).substring(1, (String(vrbl).length+1)) == vrbl)
			{
				console.log('vrbl: '+vrbl);
				return vrbl;
			}
		}

		return false;
	}
	,

	is_pipe: function(arg)
	{
		for(j=0, pipe=this.pipe_name[j].value; j < this.pipe_name.length; j++, pipe=this.pipe_name[j].value)
		{
			if(String(arg).substring(1, (String(pipe).length+1)) == pipe)
			{
				console.log('pipe: '+pipe);
				return pipe;
			}
		}

		return false;
	}
	,

	is_attribute: function(arg)
	{
		for(j=0, attr=this.attr_name[j].value; j < this.attr_name.length; j++, attr=this.attr_name[j].value)
		{
			if(String(arg).substring(1, (String(attr).length+1)) == attr)
			{
				console.log('attr: '+attr);
				return attr;
			}
	
		}

		return false;
	}
	,

	if_expression_check: function(arg)
	{
		if(String(arg).substring(0, 1) == '{')
		{
			console.log('expression: '+String(arg).substring(1, String(arg).indexOf('?')))
			console.log('statemment1: '+String(arg).substring(String(arg).indexOf('?')+1, String(arg).indexOf(':')))
			console.log('statemment2: '+String(arg).substring(String(arg).indexOf(':')+1, String(arg).indexOf('}')))
		}

		return false;
	}
	,




	regex_interpreter: function(regex, id, guild)
	{
		if(regex === undefined){ return "regex is undefined";}
		if(id === undefined){ return "id is undefined";}
		if(guild === undefined){ return "guild is undefined";}
		console.log('regex: '+regex);
		let new_channel_name = '';

		for(let i=0; i < regex.length; i++)
		{
			console.log(i + ') ' + regex[i]);

			if(regex[i] === '$')
			{
				let vrbl = this.is_variable(regex.substring(i))
				console.log('vrbl:'+vrbl);
				if(vrbl)
				{
					new_channel_name += this.get_variable_data(vrbl, id, guild);
					i += vrbl.length;
				}
				else
				{
					new_channel_name += regex[i];
				}
			}
			else if(regex[i] === '|')
			{
				let pipe = this.is_pipe(regex.substring(i))
				if(pipe)
				{
					new_channel_name += '%'+pipe+'%';
					i += pipe.length;
				}
				else
				{
					new_channel_name += regex[i];
				}
			}
			else if(regex[i] === '@')
			{
				let attr = this.is_attribute(regex.substring(i))
				if(attr)
				{
					new_channel_name += '%'+attr+'%';
					i += attr.length;
				}
				else
				{
					new_channel_name += regex[i];
				}
			}
			else
			{
				new_channel_name += regex[i];
			}
		}

		console.log('new_channel_name: '+new_channel_name);
		return new_channel_name;
	}
	,

	generate_channel_names: function (guild, portal_list)
	{
		let array_of_games = [];
		
		// for each channel in guild
		guild.channels.forEach( channel => {
			// for each channel in portal list
			for(i=0, portal=portal_list[i]; i < portal_list.length; i++, portal=portal_list[i]) {
				// for each channel in voice list of current portal channel
				for(j=0, voice=portal.voice_list[j]; j < portal.voice_list.length; j++, voice=portal.voice_list[j]) {
					// if current channel is in voice list of a portal channel
					if(channel.id === voice.id)
					{
						channel.setName(this.regex_interpreter(voice.regex, voice.id, guild));
						
						// array_of_games = object.get_status_list(guild, channel.id);
						// channel.setName(array_of_games.toString());
						
						return
					}

				}
			}
		})
	}

};
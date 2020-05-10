const object = require('./object_retrievers.js');

module.exports = {
	// variables $
	vrbl_name: [ 
		{ value: '#', func: (guild, id, portal_list) => {
			let voice_number = undefined;
			portal_list.forEach(  portal => {
				portal.voice_list.forEach( (voice, key) => {
					if(voice.id === id) {
						voice_number = key+1;
					}
				})
			})
			return voice_number;
		}},
		{value: '##', func: (guild, id, portal_list) => {
			let portal_number = undefined;
			portal_list.forEach( (portal, key) => {
				if (portal.id === id) {
					portal_number = key+1;
				}
			})
			return portal_number;
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
		{value: 'crtr', func: (guild, id, portal_list) => {
			portal_list.forEach(portal => {
				portal.voice_list.forEach(voice => {
					if(voice.id === id) {
						return voice.creator;
					}
				})
			})
		}},
		{value: 'game_lst', func: (guild, id) => { return object.get_status_list(guild, id)}},
		{value: 'game_cnt', func: (guild, id) => { //check if he is in a voice channel of a portal 
			if(typeof(object.get_status_list(guild, id)) !== "object") { return 0; }
			else{ object.get_status_list(guild, id).length; }
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
		{value: 'mmbr_plg', func: (guild, id) => { 
			let cnt = 0;
			guild.channels.forEach(channel => {
				if(channel.id === id) {
					channel.members.forEach( (member) => {
						if(member.presence.game !== null) {
							cnt++;
						}
					})
				}
			})
			return cnt;
		}},
		{value: 'mmbr_his', func: () => { return "no_yet_implemented" }},
		{value: 'mmbr_lmt', func: (guild, id) => { 
			let cnt = undefined;
			guild.channels.forEach(channel => {
				if(channel.id === id) {
					//console.log("Object.getOwnPropertyNames(channel)= ", Object.getOwnPropertyNames(channel))
					cnt = channel.userLimit; //change
				}
			})
			return cnt;
		 }},
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
	get_variable_data: function(variable, id, guild, portal_list)
	{
		for(i=0; i < this.vrbl_name.length; i++)
		{
			if(variable == this.vrbl_name[i].value)
			{
				return this.vrbl_name[i].func(guild, id, portal_list);
			}
		} 
	}
	,

	is_variable: function(arg)
	{
		for(i=0; i < this.vrbl_name.length; i++)
		{	
			console.log(String(arg).substring(1, (String(this.vrbl_name[i].value).length+1)) + " == " + this.vrbl_name[i].value);
			if(String(arg).substring(1, (String(this.vrbl_name[i].value).length+1)) == this.vrbl_name[i].value)
			{
				console.log('this.vrbl_name[i].value: '+this.vrbl_name[i].value);
				return this.vrbl_name[i].value;
			}
		}
		return false;
	}
	,

	is_pipe: function(arg)
	{
		for(i=0; i < this.pipe_name.length; i++)
		{
			if(String(arg).substring(1, (String(this.vrbl_name[i].value.value).length+1)) == this.vrbl_name[i].value.value)
			{
				console.log('this.vrbl_name[i].value.value: '+this.vrbl_name[i].value.value);
				return this.vrbl_name[i].value.value;
			}
		}

		return false;
	}
	,

	is_attribute: function(arg)
	{
		for(i=0; i < this.attr_name.length; i++)
		{
			if(String(arg).substring(1, (String(this.attr_name[i].value).length+1)) == this.attr_name[i].value)
			{
				console.log('this.attr_name[i].value: '+this.attr_name[i].value);
				return this.attr_name[i].value;
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




	regex_interpreter: function(regex, id, guild, portal_list)
	{
		if(regex === undefined){ return "regex is undefined";}
		if(id === undefined){ return "id is undefined";}
		if(guild === undefined){ return "guild is undefined";}
		
		console.log('regex: '+regex);
		let new_channel_name = ''		

		for(let i=0; i < regex.length; i++)
		{
			console.log(i + ') ' + regex[i]);

			if(regex[i] === '$')
			{
				let vrbl = this.is_variable(regex.substring(i))
				console.log('vrbl:'+vrbl);
				if(vrbl)
				{
					new_channel_name += this.get_variable_data(vrbl, id, guild, portal_list);
					
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
						channel.setName(this.regex_interpreter(voice.regex, voice.id, guild, portal_list));
						
						// array_of_games = object.get_status_list(guild, channel.id);
						// channel.setName(array_of_games.toString());
						
						return
					}

				}
			}
		})
	}

};
// ./run $# $## $ate $day $day $nth $ear $ime $our $int $cnd $rtr $ame_lst $ame_cnt $ame_his $mbr_lst $mbr_cnt $mbr_plg $mbr_his $mbr_lmt
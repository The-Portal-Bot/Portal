module.exports = {
	// arrays
	vrbl_name: [ "#", "##", "date", "time", "crtr", "game_lst", "game_cnt", "game_his",
		"mmbr_lst", "mmbr_cnt", "mmbr_plg", "mmbr_his", "mmbr_lmt" ],
	pipe_name: [ "upper", "lower", "titl", "acrnm", "word#",
		"cday", "mnth", "year", "hour", "mint", "scnd",
		"ppls", "ppls_cnt", "smmr_cnt" ],
	attr_name: [ "nbot", "mmbr_cap", "time_tolv", "titl_rfsh" ],
	//functions

	command_check: function(arg)
	{
		if(String(arg).substring(0, 1) === "$")
		{
			for(i=0, cmd=this.vrbl_name[i]; i < this.vrbl_name.length; i++, cmd=this.vrbl_name[i]) {
				if(String(arg).substring(1, (String(cmd).length+1)) === cmd)
				{
					console.log("cmd: "+cmd);
					return cmd;
				}
			}
		}

		return false;
	},

	pipe_check: function(arg, cmd)
	{
		if(String(arg).substring(0, 1) === "|")
		{
			for(j=0, func=this.pipe_name[j]; j < this.pipe_name.length; j++, func=this.pipe_name[j]) {
				if(String(arg).substring(1, (String(func).length+1)) === func)
				{
					//check for ()
					console.log("func: "+func);
					return func;
				}
			}
		}

		return false;
	},

	hashtag_check: function(arg)
	{
		if(String(arg).substring(0, 2) === "##")
		{
			// gets the channel creation number
			return "#"+"1"
		}
		else if(String(arg).substring(0, 1) === "#")
		{
			return "1"
		}

		return false;
	},

	if_expression_check: function(arg)
	{
		if(String(arg).substring(0, 1) === "{")
		{
			console.log("expression: "+String(arg).substring(1, String(arg).indexOf("?")))
			console.log("statemment1: "+String(arg).substring(String(arg).indexOf("?")+1, String(arg).indexOf(":")))
			console.log("statemment2: "+String(arg).substring(String(arg).indexOf(":")+1, String(arg).indexOf("}")))
		}

		return false;
	},

	regex_reader: function(args)
	{
		console.log("command: "+args)
		let regex_value = "";

		args.forEach( (arg, key)=> {

			console.log("arg["+key+"]: "+arg);
			
			if(this.command_check(arg))
			{
				let cmd = this.command_check(arg)
				if(this.pipe_check(arg.substring(String(cmd).length+1)))
				{
					regex_value += this.pipe_check(arg.substring(String(cmd).length+1), cmd) + " "
				}
				else
				{
					// there is no function on value
					regex_value += cmd; + " "
				}
			}
			else if(this.hashtag_check(arg))
			{
				regex_value += this.hashtag_check(arg) + " "
			}
			else if(this.if_expression_check(arg))
			{
				regex_value += this.if_expression_check(arg) + " "
			}
			else
			{
				regex_value += arg + " "
			}
		})

		console.log("regex: "+regex_value);
		return regex_value;
	}
};
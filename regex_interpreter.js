module.exports = {
	// arrays
	cmmd_name: [ "game_name", "user_limit", "users_playing", "user_count", "creator" ],
	func_name: [ "expression", "popular_max", "popular", "summary_max" ],
	//functions

	command_check: function(arg)
	{
		if(String(arg).substring(0, 1) === "$")
		{
			for(i=0, cmd=this.cmmd_name[i]; i < this.cmmd_name.length; i++, cmd=this.cmmd_name[i]) {
				console.log(String(arg).substring(1, (String(cmd).length+1))+" === "+cmd)
				if(String(arg).substring(1, (String(cmd).length+1)) === cmd)
				{
					console.log("cmd: "+cmd);
					return cmd;
				}
			}
		}

		
	},

	function_check: function(arg)
	{
		if(String(arg).substring(0, 1) === ".")
		{
			for(j=0, func=this.func_name[j]; j < this.func_name.length; j++, func=this.func_name[j]) {
				if(String(arg).substring(1, (String(func).length+1)) === func)
				{
					//check for ()
					console.log("func: "+func);
					return func;
				}
			}
		}
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
	},

	if_expression_check: function(arg)
	{
		if(String(arg).substring(0, 1) === "{")
		{
			console.log("expression: "+String(arg).substring(1, String(arg).indexOf("?")))
			console.log("statemment1: "+String(arg).substring(String(arg).indexOf("?"), String(arg).indexOf(":")))
			console.log("statemment2: "+String(arg).substring(String(arg).indexOf(":"), String(arg).indexOf("}")))
		}
	},

	regex_reader: function(args)
	{
		console.log("command: "+args)

		args.forEach( (arg, key)=> {

			console.log("arg["+key+"]: "+arg);
			
			if(this.command_check(arg))
			{
				let cmd = this.command_check(arg)
				if(this.function_check(arg.substring(String(cmd).length+1)))
				{
					let func = this.function_check(arg.substring(String(cmd).length+1))
				}
			}
			else if(hash = this.hashtag_check(arg))
			{

			}
			else if(if_exp = this.if_expression_check(arg))
			{

			}
		})
	}
};
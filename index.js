const regex = require('./regex_interpreter.js');
const editor = require('./channel_manipulation.js');

// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values.
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

let portal_list_id = new Array();
let voice_list_id = new Array();
let regex_string_id = {};

// LISTENERS

client.on("ready", () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
	// Example of changing the bot's playing game to something useful. `client.user` is what the
	// docs refer to as the "ClientUser".
	//client.user.setActivity(`Serving ${client.guilds.size} servers`);
	client.user.setActivity("[portal <ctg> <chl>", { type: "playing"});
});

client.on("guildCreate", guild => {
	// This event triggers when the bot joins a guild.
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	// client.user.setActivity(`Serving ${client.guilds.size} servers`);
	client.user.setActivity(`[create-portal <categ.> <chan.>`);
});

client.on("guildDelete", guild => {
	// this event triggers when the bot is removed from a guild.
	console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
	client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("presenceUpdate", (oldPresence, newPresence) => {
	editor.get_array_of_games(newPresence.guild, voice_list_id, regex_string_id);
	//editor.generate_channel_names(newPresence.guild, voice_list_id, regex_string_id);
});

client.on("voiceStateUpdate", (oldState, newState) => {
	let new_user_channel = newState.voiceChannel; console.log("new_user_channel: "+new_user_channel);
	let old_user_channel = oldState.voiceChannel; console.log("old_user_channel: "+old_user_channel);	

	if(old_user_channel === undefined && new_user_channel !== undefined) // JOIN from undefined
	{
		console.log("undefined->existing")

		if(portal_list_id.includes(new_user_channel.id))
		{
			// user joined portal channel
			editor.create_voice_channel(newState, voice_list_id, regex_string_id);
			editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
		}
		else if(voice_list_id.includes(new_user_channel.id))
		{
			// user joined voice channel
			editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
		}
	}
	else if(new_user_channel === undefined && old_user_channel !== undefined) // LEAVE to undefined
	{
		console.log("existing->undefined")
		
		if(portal_list_id.includes(old_user_channel.id))
		{
			// user leaves portal channel
			// is handled before
		}
		else if(voice_list_id.includes(old_user_channel.id))
		{
			// user left voice channel
			if(old_user_channel.members.size === 0) {
				editor.delete_voice_channel(old_user_channel, voice_list_id);
			}
		}
	}
	// user was moved from channel to channel
	else if(new_user_channel !== undefined && old_user_channel !== undefined)
	{
		console.log("existing->existing")
		
		if(portal_list_id.includes(old_user_channel.id))
		{
			console.log("->source: portal_list_id");
			
			if(portal_list_id.includes(new_user_channel.id))
			{
				console.log("->dest: portal_list_id")
				// this should not happen
				console.log("this should not happen error: portal_channel->portal_channel")
			}
			else if(voice_list_id.includes(new_user_channel.id))
			{
				console.log("->dest: voice_list_id")
				// has been checked before
				console.log("has been checked before")
				editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
			}
			else
			{
				console.log("->dest: unknown")
				// leaves portal channel and joins another unknown
				if(old_user_channel.members.size === 0) {
					editor.delete_voice_channel(old_user_channel, voice_list_id);
				}
				editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
			}
		}
		else if(voice_list_id.includes(old_user_channel.id))
		{
			console.log("->source: voice_list");
			
			if(portal_list_id.includes(new_user_channel.id))
			{
				console.log("->dest: portal_list_id")
				// leaves created channel and joins portal
				if(old_user_channel.members.size === 0) {
					editor.delete_voice_channel(old_user_channel, voice_list_id);
				}
				// user joined portal channel
				editor.create_voice_channel(newState, voice_list_id, regex_string_id);
				editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
			}
			else if(voice_list_id.includes(new_user_channel.id))
			{
				console.log("->dest: voice_list_id")
				// leaves created channel and joins another created
				if(old_user_channel.members.size === 0) {
					editor.delete_voice_channel(old_user_channel, voice_list_id);
				}
				editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
			}
			else
			{
				console.log("->dest: unknown")
				// leaves created channel and joins another unknown
				if(old_user_channel.members.size === 0) {
					editor.delete_voice_channel(old_user_channel, voice_list_id);
				}
				editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
			}
		}
		else
		{
			console.log("->source: unknown voice");
			
			if(portal_list_id.includes(new_user_channel.id))
			{
				console.log("->dest: portal_list_id")
				// user joined portal channel
				editor.create_voice_channel(newState, voice_list_id, regex_string_id);
				editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
			}
			else if(voice_list_id.includes(new_user_channel.id))
			{
				console.log("->dest: voice_list_id")
				// leaves created channel and joins another created
				editor.get_array_of_games(newState.guild, voice_list_id, regex_string_id);
			}
		}
	}
	else if(new_user_channel === undefined && old_user_channel === undefined)
	{
		console.log("undefined->undefined")
	}
	else
	{
		console.log("don't know how we got here")
	}

	console.log("number of portal channels: "+voice_list_id.length)
	console.log("")
})

client.on("message", async message => {
	// This event will run on every single message received, from any channel or DM.
	
	// It's good practice to ignore other bots. This also makes your bot ignore itself
	// and not get into a spam loop (we call that "botception").
	if(message.author.bot) return;
	
	// Also good practice to ignore any message that does not start with our prefix,
	// which is set in the configuration file.
	if(message.content.indexOf(config.prefix) !== 0) return;
	
	// Here we separate our "command" name, and our "arguments" for the command.
	// e.g. if we have the message "+say Is this the real life?" , we'll get the following:
	// command = say
	// args = ["Is", "this", "the", "real", "life?"]
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	

	if(command === "portal")
	{
		if(args.length === 2)
		{
			message.channel.send("channel name:\t**"+args[0]+"**")
			message.channel.send("category name:\t**"+args[1]+"**")

			editor.create_portal_channel(message.guild, args[0], args[1], portal_list_id)
		}
		else if(args.length === 1)
		{
			message.channel.send("channel name:\t**"+args[0]+"**")
			editor.create_portal_channel(message.guild, args[0], null, portal_list_id)
		}
		else
		{
			message.channel.send("**"+config.prefix+"portal <channel_name> <category_name>**\n"+
				"*(channel_name: mandatory, category_name: optional)*")
		}
	}

	if(command === "regex")
	{
		let channel_name = "";
		regex.regex_reader(args);
	}

	if(command === "purge")
	{	
		let current_guild = message.guild;

		message.guild.channels.forEach( (value) => {
			if(value.deletable) value.delete()
			.then(g => console.log(`Deleted the guild ${g}`))
			.catch(console.error);
		})
		
		current_guild.createChannel("general voice", {type: "voice"}, { bitrate: 64 })
		.then(
			current_guild.createChannel("general text", {type: "text"})
			.then( value => {
				value.send("**PURGE DONE**")
			})
		)
	}

	if(command === "ping")
	{
		// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
		// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
		const m = await message.channel.send("Ping?");
		m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.\nAPI Latency is ${Math.round(client.ping)}ms`);
	}
	


	
	if(command === "say") {
		// makes the bot say something and delete the message. As an example, it's open to anyone to use.
		// To get the "message" itself we join the `args` back into a string with spaces:
		const sayMessage = args.join(" ");
		// Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
		message.delete().catch(O_o=>{});
		// And we get the bot to say the thing:
		message.channel.send(sayMessage);
	}
	
	if(command === "kick") {
		// This command must be limited to mods and admins. In this example we just hardcode the role names.
		// Please read on Array.some() to understand this bit:
		// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
		if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
			return message.reply("Sorry, you don't have permissions to use this!");
		
		// Let's first check if we have a member and if we can kick them!
		// message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
		// We can also support getting the member by ID, which would be args[0]
		let member = message.mentions.members.first() || message.guild.members.get(args[0]);
		if(!member)
			return message.reply("Please mention a valid member of this server");
		if(!member.kickable)
			return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
		
		// slice(1) removes the first part, which here should be the user mention or ID
		// join(' ') takes all the various parts to make it a single string.
		let reason = args.slice(1).join(' ');
		if(!reason) reason = "No reason provided";
		
		// Now, time for a swift kick in the nuts!
		await member.kick(reason)
			.catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
		message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

	}
	
	if(command === "ban") {
		// Most of this command is identical to kick, except that here we'll only let admins do it.
		// In the real world mods could ban too, but this is just an example, right? ;)
		if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
			return message.reply("Sorry, you don't have permissions to use this!");
		
		let member = message.mentions.members.first();
		if(!member)
			return message.reply("Please mention a valid member of this server");
		if(!member.bannable)
			return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

		let reason = args.slice(1).join(' ');
		if(!reason) reason = "No reason provided";
		
		await member.ban(reason)
			.catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
		message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
	}
	
	if(command === "purge") {
		// This command removes all messages from all users in the channel, up to 100.
		
		// get the delete count, as an actual number.
		const deleteCount = parseInt(args[0], 10);
		
		// Ooooh nice, combined conditions. <3
		if(!deleteCount || deleteCount < 2 || deleteCount > 100)
			return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
		
		// So we get our messages, and delete them. Simple enough, right?
		const fetched = await message.channel.fetchMessages({limit: deleteCount});
		message.channel.bulkDelete(fetched)
			.catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
	}
});

client.login(config.token);
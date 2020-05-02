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

var portal_id = 0;
var portal_channels = new Array();

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




client.on("presenceUpdate", guild => {
	// this event triggers when a user changes presence
	// console.log(`presence update`);

	// portal_members.forEach( (value) => {
	// 	if(value.presence.game !== null){
	// 		if(portal_game.get(value.presence.game) !== undefined){
	// 			prev = portal_game.get(value.presence.game)
	// 			portal_game.set(value.presence.game, ++prev)
	// 		} else {
	// 			portal_game.set(value.presence.game, 1)
	// 		}
	// 	}
	// })
	
	// var mapAsc = new Map([...map.portal_game()].sort());
	// console.log(mapAsc)
});



// returns the name of the channel
function set_channel_name(newMember) {
	var channel_name = "general";

	newMember.guild.channels.get(newMember.voiceChannel.id).members.forEach( (value) => {
		if(value.presence.game !== null){
			channel_name += value.presence.game;
		}
	})
	console.log("channel_name: "+channel_name)
	return channel_name;
}

client.on("voiceStateUpdate", (oldMember, newMember) => {
	let newUserChannel = newMember.voiceChannel
	let oldUserChannel = oldMember.voiceChannel
	
	// if portal is one that we created
	if(portal_channels.includes(newUserChannel))
	{

	}
	else
	{
		if(newUserChannel !== undefined) // User Joins a voice channel
		{
			//
			let channelName = set_channel_name(newMember);
			newUserChannel.setName(channelName);
			//
			if(newUserChannel.id === portal_id)
			{
				let channelName = set_channel_name(newMember);

				newUserChannel.guild.createChannel(channelName+"-voice", {type: "voice"})
				.then(channel => {
					
					if (newUserChannel.parentID === null){ // doesn't have category
						newMember.setVoiceChannel(channel);
					} else { // has category
						channel.setParent(newUserChannel.parentID);
						newMember.setVoiceChannel(channel);
					}

				}).catch(console.error);
			}

		}
		// User leaves a voice channel
		else if(newUserChannel === undefined || newUserChannel.id === portal_id)
		{
			// console.log("about to delete channel with id: "+oldUserChannel.id)

			// if(oldUserChannel.id === portal_id)
			// {
			// 	oldUserChannel.delete()
			// 	.then(g => console.log(`Deleted the guild ${g}`))
			// 	.catch(console.error);
			// }
		}
	}
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
	
	// Let's go with a few common example commands! Feel free to delete or change those.
	



	if(command === "portal")
	{
		// make the message to array without the prefix
		var msg_arr = message.content.slice(config.prefix.length).trim().split(/ +/g)

		// print the message from the user // ["+message.channel.name+"]"
		message.channel.send("category name: **"+msg_arr[1]+"**")
		//message.channel.send("voice channel name: **"+msg_arr[2]+"-voice**")

		// Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
		// message.delete();

		var server = message.guild;
		var name = message.author.username;

		// // creating category
		// server.createChannel(msg_arr[1], {type: "category"})

		// creating voice channel
		server.createChannel(msg_arr[1]+"-voice", {type: "voice"})
		.then (channel => {
			portal_id = channel.id
			message.channel.send("channel.id: **"+channel.id+"**")
		})
		// .then(channel => {
		// 	let category = server.channels.find(
		// 		c => c.name == msg_arr[1] && c.type == "category"
		// 	);
		// 	if (!category) throw new Error("Category channel does not exist");
		// 	channel.setParent(category.id);
		// }).catch(console.error);
	}

	if(command === "w")
	{
		//message.author.setActivity(`to pouli mou`)
		// print the message from the user // ["+message.channel.name+"]"
		//message.channel.send("you are playing: **"+client.user.game+"**")
		//message.channel.send("you are playing: **"+data.game.name+"**")
		
		//let channel = new Discord.Channel();

		message.guild.createChannel('new-general', {type: "category"})
		.then(console.log)
		.catch(console.error);

		message.guild.channels.forEach( (value) => {
			message.channel.send("client.channels: "+value.name+"****")
		})

		message.channel.send("you are playing: **"+message.author.presence.game+"**")
		message.channel.send("channel name: **"+channel_nm+"**")
	}











	if(command === "ping") {
		// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
		// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
		const m = await message.channel.send("Ping?");
		m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
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
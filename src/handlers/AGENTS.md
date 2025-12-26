# AGENTS.md - Handlers Directory

## Directory Purpose

Core system handlers that manage the bot's primary subsystems: Discord connection, MongoDB database, event routing, and command processing.

## Handler Files

| File | Purpose |
|------|---------|
| `discord.handler.ts` | Discord client initialization and connection |
| `mongo.handler.ts` | MongoDB connection and configuration |
| `event.handler.ts` | Discord event listener registration |
| `command.handler.ts` | Command routing and execution |

## Agent Skills for Handlers

### 1. Discord Client Management
- Initialize Discord.js Client with proper intents
- Manage gateway connection lifecycle
- Handle reconnection and errors

### 2. Database Connection
- Mongoose connection with options
- Connection event handling
- Pool management

### 3. Event System
- Register Discord event listeners
- Route events to handlers
- Manage event lifecycle

### 4. Command Processing
- Route interactions to commands
- Handle cooldowns
- Process command responses

## Handler Details

### discord.handler.ts
```typescript
// Initializes Discord client with required intents
// Exports clientHandler and connectToDiscord
import { Client, GatewayIntentBits } from "npm:discord.js";

export const clientHandler = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    // ... other intents
  ],
});

export async function connectToDiscord(token: string) {
  await clientHandler.login(token);
}
```

### mongo.handler.ts
```typescript
// MongoDB connection handler
import mongoose, { type ConnectOptions } from "npm:mongoose";

export async function mongoHandler(mongoUrl: string) {
  const connectOptions: ConnectOptions = {
    dbName: "portal",
    compressors: "zlib",
    maxPoolSize: 50,
    wtimeoutMS: 2500,
  };
  
  return await mongoose.connect(mongoUrl, connectOptions);
}
```

### event.handler.ts
```typescript
// Registers all Discord event listeners
import * as events from "../events/index.ts";

export function eventHandler(client: Client) {
  client.on("ready", () => events.ready(client));
  client.on("voiceStateUpdate", (o, n) => 
    events.voiceStateUpdate(client, o, n)
  );
  // ... register all events
}
```

### command.handler.ts
```typescript
// Processes incoming command interactions
export async function commandHandler(
  interaction: ChatInputCommandInteraction,
  pGuild: PGuild,
  activeCooldowns: ActiveCooldowns
) {
  // Find command
  // Check cooldowns
  // Verify permissions
  // Execute command
  // Handle response
}
```

## Initialization Flow

```
app.ts
  │
  ├─► mongoHandler(MONGO_URL)
  │     └─► Connect to MongoDB
  │
  ├─► REST.put(applicationCommands)
  │     └─► Register slash commands
  │
  ├─► eventHandler(client)
  │     └─► Register all event listeners
  │
  └─► connectToDiscord(DISCORD_TOKEN)
        └─► Login and start bot
```

## Modifying Handlers

### Add New Intent
```typescript
// discord.handler.ts
export const clientHandler = new Client({
  intents: [
    // ... existing
    GatewayIntentBits.NewIntent,
  ],
});
```

### Add MongoDB Event
```typescript
// mongo.handler.ts
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});
```

### Register New Event
```typescript
// event.handler.ts
client.on("newEvent", (data) => 
  events.newEvent(client, data)
);
```

## Error Handling

Handlers should:
1. Log connection states
2. Exit gracefully on critical failures
3. Emit warnings for recoverable issues
4. Use proper exit codes (1=Discord, 2=Mongo, 4=ClientID)

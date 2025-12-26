# AGENTS.md - Events Directory

## Directory Purpose

Contains Discord event handlers that respond to various Discord gateway events.

## Event Files

| File | Event | Purpose |
|------|-------|---------|
| `channelDelete.event.ts` | channelDelete | Cleanup when channels are deleted |
| `guildCreate.event.ts` | guildCreate | Bot joins a new server |
| `guildDelete.event.ts` | guildDelete | Bot leaves/removed from server |
| `guildMemberAdd.event.ts` | guildMemberAdd | New member joins server |
| `guildMemberRemove.event.ts` | guildMemberRemove | Member leaves server |
| `interactionCreate.event.ts` | interactionCreate | Slash command/button interactions |
| `messageCreate.event.ts` | messageCreate | New message sent |
| `messageDelete.event.ts` | messageDelete | Message deleted |
| `messageReactionAdd.event.ts` | messageReactionAdd | Reaction added to message |
| `ready.event.ts` | ready | Bot successfully connected |
| `voiceStateUpdate.event.ts` | voiceStateUpdate | Voice channel state changes |
| `index.ts` | - | Event registration |

## Agent Skills for Events

### 1. Event Handler Creation
- Export async function matching event signature
- Handle null checks for partial data
- Use proper Discord.js event types

### 2. Voice State Management
- Track user joins/leaves in voice channels
- Manage dynamic voice channel creation
- Handle music bot voice state

### 3. Interaction Processing
- Route slash commands to handlers
- Handle button/select interactions
- Manage autocomplete responses

### 4. Database Synchronization
- Fetch/update guild data on events
- Clean up orphaned data
- Maintain state consistency

## Event Handler Template

```typescript
import type { Client, EventType } from "npm:discord.js";
import logger from "../utilities/log.utility.ts";

export async function eventName(
  client: Client,
  // ... event-specific parameters
): Promise<void> {
  logger.info(`eventName triggered`);
  
  // Validate required data
  if (!requiredData) {
    logger.warn("Missing required data");
    return;
  }
  
  try {
    // Event handling logic
  } catch (error) {
    logger.error(`Error in eventName: ${error}`);
  }
}
```

## Key Event Patterns

### voiceStateUpdate
Most complex event - handles:
- Dynamic voice channel creation/deletion
- Channel name updates
- Music playback state
- User timestamp tracking

```typescript
export async function voiceStateUpdate(
  client: Client,
  oldState: VoiceState,
  newState: VoiceState,
): Promise<void> {
  // User moved between channels
  if (newState.channel?.id === oldState.channel?.id) return;
  
  const newChannel = newState.channel; // joined
  const oldChannel = oldState.channel; // left
  
  // Handle portal channel logic
}
```

### interactionCreate
Routes all interactions:
```typescript
export async function interactionCreate(
  client: Client,
  interaction: Interaction,
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  
  // Find and execute command
  const command = commands.get(interaction.commandName);
  await command.execute(interaction, pGuild);
}
```

### guildCreate/guildDelete
Server lifecycle:
```typescript
// On join - initialize guild data
export async function guildCreate(guild: Guild): Promise<void> {
  await insertGuild(guild.id, guild.name);
}

// On leave - cleanup guild data
export async function guildDelete(guild: Guild): Promise<void> {
  await deleteGuild(guild.id);
}
```

## Event Registration

Events are registered in `index.ts` and connected via `event.handler.ts`:

```typescript
// index.ts
export { channelDelete } from "./channelDelete.event.ts";
export { guildCreate } from "./guildCreate.event.ts";
// ...

// event.handler.ts
client.on("voiceStateUpdate", (oldState, newState) => 
  voiceStateUpdate(client, oldState, newState)
);
```

## Best Practices

1. **Always null-check** - Events can have partial data
2. **Log entry points** - Debug with logger.info at start
3. **Handle errors gracefully** - Don't crash on event failures
4. **Fetch fresh data** - Don't rely on cached guild data
5. **Rate limit awareness** - Some events fire rapidly

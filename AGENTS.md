# AGENTS.md - Portal Discord Bot

## Project Overview

Portal is a fully-fledged, feature-rich Discord bot built with **Deno 2** and **Discord.js v14**. It provides automatic voice channel generation, music playback, role management, and various utility commands.

## Tech Stack

- **Runtime**: Deno 2.6.3
- **Framework**: Discord.js v14.17.2
- **Database**: MongoDB (via Mongoose)
- **Language**: TypeScript (strict mode)
- **Audio**: @discordjs/voice, @discordjs/opus, ytdl-core

## Project Structure

```
Portal/
├── src/
│   ├── app.ts                 # Application entry point
│   ├── commands/              # Slash commands (auth/noAuth)
│   ├── events/                # Discord event handlers
│   ├── handlers/              # Core handlers (discord, mongo, events)
│   ├── Interpreter/           # Channel name interpreter system
│   ├── libraries/             # Shared utility libraries
│   ├── types/                 # TypeScript types and interfaces
│   ├── blueprints/            # Command/feature blueprints
│   ├── assets/                # Static assets (images, lists, audio)
│   └── utilities/             # Logging and utilities
├── docs/                      # Documentation
├── docker/                    # Docker configuration
└── deno.json                  # Deno configuration
```

## Key Commands

```bash
# Start the bot
deno task start

# Development mode with watch
deno task dev

# Lint code
deno task lint

# Format code
deno task fmt
```

## Agent Skills

### 1. Discord Bot Development
- Create and modify slash commands in `src/commands/`
- Handle Discord events in `src/events/`
- Work with Discord.js v14 API patterns
- Implement permission checks and rate limiting

### 2. TypeScript/Deno Development
- Write strict TypeScript code
- Use Deno-specific imports (`npm:`, `jsr:`)
- Follow project's type definitions in `src/types/`
- Use proper async/await patterns

### 3. Database Operations
- MongoDB operations via Mongoose in `src/libraries/mongo.library.ts`
- Work with Guild, Member, and Channel data models
- Handle data persistence for bot state

### 4. Text Interpreter System
- Work with the channel name interpreter in `src/Interpreter/`
- Understand Variables, Attributes, Pipes, and Structures
- Implement dynamic channel naming features

### 5. Voice & Audio
- Voice channel management
- Music playback functionality (when enabled)
- Audio streaming with ytdl-core

## Code Conventions

### File Naming
- Commands: `command_name.ts` (snake_case)
- Events: `eventName.event.ts` (camelCase + .event suffix)
- Libraries: `name.library.ts`
- Types/Classes: `PName.class.ts` (P prefix for Portal)
- Tests: `name.test.ts`

### Command Structure
```typescript
export default {
  time: number,           // Cooldown in seconds
  premium: boolean,       // Premium-only command
  ephemeral: boolean,     // Ephemeral response
  auth: boolean,          // Requires authentication
  scopeLimit: ScopeLimit, // NONE, MEMBER, CHANNEL, GUILD
  slashCommand: SlashCommandBuilder,
  execute: async (interaction, pGuild?) => Promise<ReturnPromise>
}
```

### Import Style
- Use `npm:` prefix for npm packages
- Use relative paths for internal imports
- Group imports: external, then internal

## Environment Variables

Required environment variables:
- `DISCORD_TOKEN` - Discord bot token
- `MONGO_URL` - MongoDB connection string
- `CLIENT_ID` - Discord application client ID
- `LOG` - Enable file logging ("true"/"false")

## Testing

- Test files use `.test.ts` extension
- Located alongside source files
- Use `@std/expect` for assertions

## Important Notes

1. **Rate Limiting**: Discord limits channel name updates to 2 per 10 minutes
2. **Privacy**: Portal never records conversations or stores user messages
3. **Slash Commands**: All commands use Discord's slash command system
4. **Permissions**: Commands are split into `auth` (requires permissions) and `noAuth` (public)

## Common Tasks

### Adding a New Command
1. Create file in `src/commands/auth/` or `src/commands/noAuth/`
2. Export default Command object with slashCommand builder
3. Add export to corresponding `index.ts`

### Adding a New Event
1. Create file in `src/events/` with `.event.ts` suffix
2. Export async function with event handler
3. Register in `src/events/index.ts`

### Modifying Database Schema
1. Update model in `src/types/models/`
2. Update corresponding class in `src/types/classes/`
3. Update mongo.library.ts operations

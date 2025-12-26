# AGENTS.md - Source Code Directory

## Directory Purpose

The `src/` directory contains all source code for the Portal Discord bot.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `app.ts` | Application entry point - initializes Discord client, registers commands, connects to MongoDB |
| `commands/` | Slash command implementations (auth/noAuth split) |
| `events/` | Discord event handlers (voice, messages, reactions, etc.) |
| `handlers/` | Core system handlers (Discord, MongoDB, events, commands) |
| `Interpreter/` | Dynamic channel name interpreter system |
| `libraries/` | Shared utility functions and API wrappers |
| `types/` | TypeScript definitions, classes, enums, models |
| `blueprints/` | Configuration blueprints for features |
| `assets/` | Static files (images, audio, data lists) |
| `utilities/` | Logging and helper utilities |

## Agent Skills for `/src`

### Application Bootstrap
- Understand app.ts initialization flow
- REST API setup for slash command registration
- Environment variable handling
- Logger configuration

### Module System
- Deno's ES module imports
- Re-exports via index.ts files
- Type-only imports for interfaces

### Error Handling
- Use logger from `utilities/log.utility.ts`
- Return `ReturnPromise` objects from commands
- Handle Discord API errors gracefully

## Key Patterns

### Slash Command Registration
```typescript
// Commands are auto-registered from auth/noAuth index exports
const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
await rest.put(Routes.applicationCommands(CLIENT_ID), {
  body: [...Object.values(auth), ...Object.values(noAuth)]
    .map((command) => command.slashCommand.toJSON()),
});
```

### Module Re-exports
```typescript
// index.ts pattern for command directories
export { default as ban } from "./ban.ts";
export { default as kick } from "./kick.ts";
```

## File Dependencies

```
app.ts
├── commands/auth/index.ts
├── commands/noAuth/index.ts
├── handlers/discord.handler.ts
├── handlers/event.handler.ts
├── handlers/mongo.handler.ts
├── types/classes/PTypes.interface.ts
└── utilities/log.utility.ts
```

## Common Modifications

### Add New Feature
1. Create library in `libraries/` if shared logic needed
2. Add types in `types/` directory
3. Create command in `commands/`
4. Add event handler if needed in `events/`

### Debug Issues
1. Check logger output configuration
2. Verify environment variables
3. Check MongoDB connection status
4. Review Discord API rate limits

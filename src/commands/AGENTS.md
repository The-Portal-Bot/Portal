# AGENTS.md - Commands Directory

## Directory Purpose

Contains all Discord slash command implementations, split into authenticated and non-authenticated commands.

## Structure

```
commands/
├── auth/           # Commands requiring permissions (admin/mod)
│   ├── index.ts    # Re-exports all auth commands
│   ├── ban.ts
│   ├── kick.ts
│   ├── portal.ts
│   └── ...
└── noAuth/         # Public commands anyone can use
    ├── index.ts    # Re-exports all noAuth commands
    ├── help.ts
    ├── ping.ts
    └── ...
```

## Agent Skills for Commands

### 1. Slash Command Creation
- Use `@discordjs/builders` SlashCommandBuilder
- Define options (string, number, user, channel, etc.)
- Set context types (Guild, DM, etc.)
- Handle subcommands and groups

### 2. Permission Management
- `auth: true/false` - requires authentication
- `scopeLimit` - NONE, MEMBER, CHANNEL, GUILD
- `premium: true/false` - premium feature flag
- Use `isMod()` helper for permission checks

### 3. Interaction Handling
- Handle `ChatInputCommandInteraction`
- Use ephemeral responses for private replies
- Implement confirmation dialogs with buttons
- Handle deferred replies for long operations

### 4. Cooldown System
- `time` property sets cooldown in seconds
- Cooldowns tracked per guild/member

## Command Template

```typescript
import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
} from "npm:discord.js";
import type { Command } from "../../types/Command.ts";
import {
  type ReturnPromise,
  ScopeLimit,
} from "../../types/classes/PTypes.interface.ts";

const COMMAND_NAME = "example";
const DESCRIPTION = "Example command description";

export default {
  time: 1,                        // Cooldown seconds
  premium: false,                 // Premium only
  ephemeral: true,               // Ephemeral response
  auth: false,                   // Requires auth
  scopeLimit: ScopeLimit.NONE,   // Scope limitation
  slashCommand: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Input description")
        .setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<ReturnPromise> {
    const input = interaction.options.getString("input");
    
    // Command logic here
    
    return {
      result: true,
      value: "Success message",
    };
  },
} satisfies Command;
```

## ReturnPromise Structure

```typescript
interface ReturnPromise {
  result: boolean;  // Success/failure
  value: string;    // Message to display
}
```

## Adding a New Command

1. **Create the file** in appropriate directory (`auth/` or `noAuth/`)
2. **Implement Command interface** with all required properties
3. **Export from index.ts**:
   ```typescript
   export { default as myCommand } from "./my_command.ts";
   ```
4. **Restart bot** to register new slash command

## Auth vs NoAuth

### Auth Commands (`auth/`)
- Require mod/admin permissions
- Actions affecting server (ban, kick, settings)
- Portal channel management
- Server configuration

### NoAuth Commands (`noAuth/`)
- Available to all users
- Information queries (help, ping, weather)
- User-specific actions (whoami, level)
- Entertainment (poll, roll, bet)

## Common Patterns

### Get User Option
```typescript
const member = interaction.options.getMember("user") as GuildMember;
```

### Deferred Reply
```typescript
await interaction.deferReply({ ephemeral: true });
// ... long operation
await interaction.editReply({ content: "Done!" });
```

### Confirmation Dialog
```typescript
import { askForApprovalByInteraction } from "../../libraries/help.library.ts";
const approved = await askForApprovalByInteraction(
  interaction,
  "Confirm action?",
  ButtonStyle.Danger
);
```

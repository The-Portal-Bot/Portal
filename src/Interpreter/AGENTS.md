# AGENTS.md - Interpreter Directory

## Directory Purpose

The Interpreter is Portal's dynamic channel naming system. It processes template strings containing variables, attributes, pipes, and structures to generate contextual voice channel names.

## How It Works

When a voice channel is created, Portal interprets a "regex name" template to generate the actual channel name based on current context (users, games, time, etc.).

Example: `$game | $#members members` → `Minecraft | 3 members`

## Interpreter Components

| File | Component | Syntax | Purpose |
|------|-----------|--------|---------|
| `variable.functions.ts` | Variables | `$name` | Live immutable data (game, members, time) |
| `attribute.functions.ts` | Attributes | `&name` | Mutable settings (locale, prefix) |
| `pipe.functions.ts` | Pipes | `\|pipe` | Transform text output |
| `structure.functions.ts` | Structures | `{if}...{/if}` | Conditional logic |

## Agent Skills for Interpreter

### 1. Variable Processing
- Parse `$variable` syntax
- Fetch live data (games, member count, time)
- Handle missing/null values

### 2. Attribute Handling
- Parse `&attribute` syntax
- Read/write guild settings
- Validate attribute values

### 3. Pipe Transformations
- Parse `|pipe` syntax
- String transformations (uppercase, truncate)
- Chained operations

### 4. Structural Logic
- Parse `{structure}` syntax
- Conditional rendering
- Loops and branches

## Variable Examples

| Variable | Output Example | Description |
|----------|---------------|-------------|
| `$game` | "Minecraft" | Most played game in channel |
| `$#members` | "5" | Number of members in channel |
| `$time` | "14:30" | Current time |
| `$creator` | "JohnDoe" | Channel creator name |
| `$date` | "Dec 26" | Current date |

## Attribute Examples

| Attribute | Default | Description |
|-----------|---------|-------------|
| `&locale` | "en" | Language setting |
| `&prefix` | "!" | Command prefix |
| `&regex` | "$game" | Channel name template |

## Pipe Examples

| Pipe | Input | Output | Description |
|------|-------|--------|-------------|
| `\|upper` | "hello" | "HELLO" | Uppercase |
| `\|lower` | "HELLO" | "hello" | Lowercase |
| `\|truncate(10)` | "Hello World!" | "Hello Wor…" | Truncate |
| `\|acronym` | "Counter Strike" | "CS" | First letters |

## Structure Examples

```
{if $#members > 1}
  Team: $game
{else}
  Solo: $creator
{/if}
```

## Code Patterns

### variable.functions.ts
```typescript
import { VariableBlueprints } from "../blueprints/variable.blueprint.ts";

// Check if string is a variable
export function isVariable(candidate: string): string {
  for (const blueprint of VariableBlueprints) {
    const subString = candidate.substring(1, blueprint.name.length + 1);
    if (subString === blueprint.name) {
      return blueprint.name;
    }
  }
  return "";
}

// Get variable value
export function getVariable(
  voiceChannel: VoiceChannel,
  pVoiceChannel: PVoiceChannel | null,
  pChannels: PChannel[],
  pGuild: PGuild,
  guild: Guild,
  variable: string,
) {
  const blueprint = VariableBlueprints.find(b => b.name === variable);
  if (!blueprint) return -1;
  
  return blueprint.get({
    voiceChannel,
    pVoiceChannel,
    pChannels,
    pGuild,
    guild,
  });
}
```

### Blueprints Integration

Variables, attributes, pipes, and structures are defined in `../blueprints/`:

```typescript
// blueprints/variable.blueprint.ts
export const VariableBlueprints = [
  {
    name: "game",
    get: ({ voiceChannel }) => getMostPlayedGame(voiceChannel),
  },
  {
    name: "#members",
    get: ({ voiceChannel }) => voiceChannel.members.size,
  },
  // ... more variables
];
```

## Adding New Interpreter Feature

### New Variable
1. Add to `blueprints/variable.blueprint.ts`:
```typescript
{
  name: "newvar",
  description: "Description of new variable",
  get: ({ voiceChannel, pGuild, guild }) => {
    // Return computed value
    return computeValue();
  },
}
```

### New Pipe
1. Add to `blueprints/pipe.blueprint.ts`:
```typescript
{
  name: "newpipe",
  description: "Transform description",
  transform: (input: string, args?: string[]) => {
    // Return transformed string
    return transformedInput;
  },
}
```

## Channel Name Generation Flow

```
Template: "$game | $#members players"
    │
    ├─► Parse variables ($game, $#members)
    │     ├─► Fetch game: "Valorant"
    │     └─► Count members: 4
    │
    ├─► Parse attributes (none in this example)
    │
    ├─► Apply pipes (none in this example)
    │
    ├─► Process structures (none in this example)
    │
    └─► Final: "Valorant | 4 players"
```

## Rate Limiting Note

Discord limits channel name updates to **2 per 10 minutes**. The interpreter results are cached and updates are throttled accordingly.

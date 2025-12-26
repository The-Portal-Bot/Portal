# AGENTS.md - Blueprints Directory

## Directory Purpose

Blueprints define the configuration and behavior for Portal's dynamic features: variables, attributes, pipes, and structures used in the channel name interpreter.

## Blueprint Files

| File | Purpose |
|------|---------|
| `variable.blueprint.ts` | Defines available variables (`$name`) |
| `attribute.blueprint.ts` | Defines configurable attributes (`&name`) |
| `pipe.blueprint.ts` | Defines text transformation pipes (`\|name`) |
| `structure.blueprint.ts` | Defines control structures (`{if}...{/if}`) |

## Agent Skills for Blueprints

### 1. Blueprint Definition
- Define new variables/attributes/pipes/structures
- Implement getter/setter functions
- Add validation rules

### 2. Type Safety
- Strong typing for blueprint interfaces
- Proper return types
- Context parameter typing

### 3. Documentation
- Description fields for user-facing docs
- Example usage
- Parameter documentation

## Blueprint Interfaces

### Variable Blueprint
```typescript
interface VariableBlueprint {
  name: string;           // Variable name (without $)
  description: string;    // User-facing description
  get: (context: VariableContext) => string | number;
}

interface VariableContext {
  voiceChannel: VoiceChannel;
  pVoiceChannel: PVoiceChannel | null;
  pChannels: PChannel[];
  pGuild: PGuild;
  guild: Guild;
}
```

### Attribute Blueprint
```typescript
interface AttributeBlueprint {
  name: string;           // Attribute name (without &)
  description: string;    // User-facing description
  default: any;           // Default value
  get: (context: AttributeContext) => any;
  set: (context: AttributeContext, value: any) => boolean;
}
```

### Pipe Blueprint
```typescript
interface PipeBlueprint {
  name: string;           // Pipe name (without |)
  description: string;    // User-facing description
  args?: string[];        // Optional argument names
  transform: (input: string, args?: string[]) => string;
}
```

### Structure Blueprint
```typescript
interface StructureBlueprint {
  name: string;           // Structure name (e.g., "if")
  description: string;    // User-facing description
  process: (content: string, context: StructureContext) => string;
}
```

## Example Blueprints

### variable.blueprint.ts
```typescript
export const VariableBlueprints: VariableBlueprint[] = [
  {
    name: "game",
    description: "The most played game in the voice channel",
    get: ({ voiceChannel }) => {
      const games = voiceChannel.members
        .map(m => m.presence?.activities.find(a => a.type === 0)?.name)
        .filter(Boolean);
      
      // Return most common game
      return getMostCommon(games) || "No Game";
    },
  },
  {
    name: "#members",
    description: "Number of members in voice channel",
    get: ({ voiceChannel }) => voiceChannel.members.size,
  },
  {
    name: "creator",
    description: "Name of the channel creator",
    get: ({ voiceChannel, pVoiceChannel, guild }) => {
      if (!pVoiceChannel) return "Unknown";
      const creator = guild.members.cache.get(pVoiceChannel.odId);
      return creator?.displayName || "Unknown";
    },
  },
  {
    name: "time",
    description: "Current time in HH:MM format",
    get: ({ pGuild }) => {
      const now = new Date();
      return now.toLocaleTimeString(pGuild.locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];
```

### pipe.blueprint.ts
```typescript
export const PipeBlueprints: PipeBlueprint[] = [
  {
    name: "upper",
    description: "Convert to uppercase",
    transform: (input) => input.toUpperCase(),
  },
  {
    name: "lower",
    description: "Convert to lowercase",
    transform: (input) => input.toLowerCase(),
  },
  {
    name: "truncate",
    description: "Truncate to specified length",
    args: ["length"],
    transform: (input, args) => {
      const length = parseInt(args?.[0] || "20", 10);
      if (input.length <= length) return input;
      return input.substring(0, length - 1) + "…";
    },
  },
  {
    name: "acronym",
    description: "Convert to acronym (first letters)",
    transform: (input) => {
      return input
        .split(/\s+/)
        .map(word => word[0]?.toUpperCase() || "")
        .join("");
    },
  },
];
```

### attribute.blueprint.ts
```typescript
export const AttributeBlueprints: AttributeBlueprint[] = [
  {
    name: "locale",
    description: "Language setting for the guild",
    default: "en",
    get: ({ pGuild }) => pGuild.locale,
    set: ({ pGuild }, value) => {
      // Validate locale
      if (!SUPPORTED_LOCALES.includes(value)) return false;
      pGuild.locale = value;
      return true;
    },
  },
  {
    name: "regex",
    description: "Channel name template pattern",
    default: "$game",
    get: ({ pChannel }) => pChannel.regexName,
    set: ({ pChannel }, value) => {
      pChannel.regexName = value;
      return true;
    },
  },
];
```

## Adding New Blueprint

### 1. Add to Blueprint Array
```typescript
// In appropriate blueprint file
export const VariableBlueprints = [
  // ... existing
  {
    name: "newvariable",
    description: "Description for documentation",
    get: (context) => {
      // Compute and return value
      return computedValue;
    },
  },
];
```

### 2. Update Documentation
Blueprints are used to generate user-facing documentation at portal-bot.xyz

### 3. Test
Verify the new blueprint:
- Returns expected values
- Handles edge cases (null, undefined)
- Works with pipes/structures if applicable

## Best Practices

1. **Keep getters pure** - No side effects in get functions
2. **Handle nulls** - Always check for null/undefined context
3. **Type safety** - Use proper TypeScript types
4. **Documentation** - Write clear descriptions for users
5. **Performance** - Cache expensive computations

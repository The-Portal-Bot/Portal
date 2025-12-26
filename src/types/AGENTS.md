# AGENTS.md - Types Directory

## Directory Purpose

TypeScript type definitions, interfaces, classes, enums, and MongoDB models that define the data structures used throughout the Portal bot.

## Structure

```
types/
├── Command.ts           # Command interface definition
├── classes/             # Portal class definitions
│   ├── PGiveRole.class.ts
│   ├── PGuild.class.ts
│   ├── PMember.class.ts
│   ├── PPoll.class.ts
│   ├── PPortalChannel.class.ts
│   ├── PTypes.interface.ts
│   └── PVoiceChannel.class.ts
├── enums/               # Enumeration definitions
│   ├── Admin.enum.ts
│   ├── Locales.enum.ts
│   ├── OpapGames.enum.ts
│   └── ...
└── models/              # Mongoose schema models
    └── ...
```

## Agent Skills for Types

### 1. Class Definitions
- Define Portal-specific data structures
- Implement class methods
- Handle serialization/deserialization

### 2. Interface Design
- Define contracts for data exchange
- Create type guards
- Handle optional properties

### 3. Enum Management
- Define constant sets
- Use for type-safe options
- Map to display values

### 4. Mongoose Models
- Define database schemas
- Add validation rules
- Create indexes

## Key Types

### Command.ts
```typescript
export type Command = {
  time: number;           // Cooldown in seconds
  premium: boolean;       // Premium-only feature
  ephemeral: boolean;     // Ephemeral response
  auth: boolean;          // Requires authentication
  scopeLimit: ScopeLimit; // Permission scope
  slashCommand: SlashCommandBuilder;
  execute: (
    interaction: ChatInputCommandInteraction,
    pGuild?: PGuild,
  ) => Promise<ReturnPromise>;
};
```

### PTypes.interface.ts
```typescript
// Core interfaces used across the application
export interface ReturnPromise {
  result: boolean;
  value: string;
}

export enum ScopeLimit {
  NONE = "none",
  MEMBER = "member",
  CHANNEL = "channel",
  GUILD = "guild",
}

export interface ActiveCooldowns {
  guild: CooldownEntry[];
  member: CooldownEntry[];
}
```

### PGuild.class.ts
```typescript
// Guild (server) data structure
export class PGuild {
  id: string;              // Discord guild ID
  name: string;            // Guild name
  prefix: string;          // Command prefix (legacy)
  locale: Locale;          // Language setting
  premium: boolean;        // Premium status
  pChannels: PChannel[];   // Portal channels
  // ... more properties
}
```

### PPortalChannel.class.ts
```typescript
// Portal channel configuration
export class PChannel {
  id: string;              // Discord channel ID
  creatorId: string;       // Creator's user ID
  regexName: string;       // Dynamic name pattern
  voiceList: PVoiceChannel[]; // Generated voice channels
  // ... more properties
}
```

### PVoiceChannel.class.ts
```typescript
// Generated voice channel
export class PVoiceChannel {
  id: string;              // Discord channel ID
  odId: string;            // Owner's user ID
  createdAt: Date;         // Creation timestamp
  // ... more properties
}
```

### PMember.class.ts
```typescript
// Guild member data
export class PMember {
  odId: string;            // Discord user ID
  guildId: string;         // Guild ID
  level: number;           // Experience level
  points: number;          // Activity points
  // ... more properties
}
```

## Naming Conventions

- **Classes**: `PName.class.ts` - P prefix for Portal
- **Interfaces**: `PTypes.interface.ts` or inline
- **Enums**: `Name.enum.ts`
- **Models**: Located in `models/` directory

## Type Patterns

### Optional with Defaults
```typescript
interface Config {
  enabled?: boolean;  // Optional
  timeout: number;    // Required
}

const config: Config = {
  timeout: 5000,
  // enabled defaults to undefined
};
```

### Union Types
```typescript
type ActionResult = "success" | "failure" | "pending";
```

### Type Guards
```typescript
function isPGuild(obj: unknown): obj is PGuild {
  return obj !== null && 
         typeof obj === "object" && 
         "id" in obj;
}
```

## Adding New Types

### New Class
```typescript
// src/types/classes/PNewThing.class.ts
export class PNewThing {
  id: string;
  name: string;
  
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
```

### New Enum
```typescript
// src/types/enums/NewType.enum.ts
export enum NewType {
  OPTION_A = "option_a",
  OPTION_B = "option_b",
  OPTION_C = "option_c",
}
```

### New Model
```typescript
// src/types/models/newThing.model.ts
import { Schema, model } from "npm:mongoose";

const newThingSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
});

export const NewThingModel = model("NewThing", newThingSchema);
```

## Best Practices

1. **Use `type` for simple aliases**, `interface` for objects
2. **Export all public types** from module
3. **Avoid `any`** - use `unknown` if type is truly unknown
4. **Document complex types** with JSDoc comments
5. **Keep models in sync** with classes

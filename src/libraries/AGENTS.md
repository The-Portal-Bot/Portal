# AGENTS.md - Libraries Directory

## Directory Purpose

Shared utility libraries providing reusable functions across the bot. These are the core building blocks used by commands, events, and handlers.

## Library Files

| File | Purpose |
|------|---------|
| `adapter.library.ts` | Data transformation and adaptation |
| `guild.library.ts` | Guild/server operations |
| `help.library.ts` | Helper functions, UI components |
| `http.library.ts` | HTTP requests, web scraping |
| `localisation.library.ts` | Multi-language support |
| `mod.library.ts` | Moderation utilities |
| `mongo.library.ts` | Database CRUD operations |
| `music.library.ts` | Music playback (legacy) |
| `music.library2.ts` | Music playback (new) |
| `preprocessor.library.ts` | Input preprocessing |
| `status.library.ts` | Bot status management |
| `user.library.ts` | User-related operations |
| `voice.library.ts` | Voice channel utilities |

## Agent Skills for Libraries

### 1. Database Operations (mongo.library.ts)
- CRUD for guilds, members, channels
- Query building and optimization
- Transaction handling

### 2. Discord Utilities (help.library.ts)
- Message formatting
- Embed builders
- Button/interaction helpers
- Approval dialogs

### 3. HTTP Requests (http.library.ts)
- API calls (weather, crypto, etc.)
- Web scraping
- Response parsing

### 4. Guild Management (guild.library.ts)
- Channel creation/deletion
- Dynamic naming
- Portal channel management

### 5. User Operations (user.library.ts)
- Ban/kick/mute
- Role management
- User data tracking

### 6. Voice Features (voice.library.ts)
- Voice channel manipulation
- Member movement
- State tracking

## Key Library Patterns

### mongo.library.ts
```typescript
// Fetch operations
export async function fetchGuild(guildId: string): Promise<PGuild | null>
export async function fetchMember(guildId: string, odId: string): Promise<PMember | null>

// Insert operations
export async function insertGuild(guildId: string, name: string): Promise<boolean>
export async function insertMember(guildId: string, odId: string): Promise<boolean>

// Update operations
export async function updateGuild(guildId: string, key: string, value: any): Promise<boolean>

// Delete operations
export async function deleteGuild(guildId: string): Promise<boolean>
export async function removeVoice(guildId: string, odId: string): Promise<boolean>
```

### help.library.ts
```typescript
// Interaction helpers
export async function askForApprovalByInteraction(
  interaction: ChatInputCommandInteraction,
  question: string,
  style: ButtonStyle
): Promise<boolean>

// Validation helpers
export function isMod(member: GuildMember): boolean
export function isChannelDeleted(channel: Channel): boolean
export function isGuildDeleted(guild: Guild): boolean

// Message helpers
export function messageHelp(command: string, description: string): string
export async function updateMusicMessage(/* ... */): Promise<void>
```

### guild.library.ts
```typescript
// Portal channel management
export async function createVoiceChannel(
  guild: Guild,
  pGuild: PGuild,
  member: GuildMember,
  portalChannel: PChannel
): Promise<VoiceChannel>

export async function generateChannelName(
  voiceChannel: VoiceChannel,
  pVoiceChannel: PVoiceChannel,
  pChannels: PChannel[],
  pGuild: PGuild,
  guild: Guild
): Promise<string>

export function includedInPChannels(
  channelId: string,
  pChannels: PChannel[]
): PChannel | undefined

export function includedInVoiceList(
  channelId: string,
  pChannel: PChannel
): PVoiceChannel | undefined
```

### user.library.ts
```typescript
// Moderation
export async function ban(
  member: GuildMember,
  options: BanOptions
): Promise<boolean>

export async function kick(
  member: GuildMember,
  reason?: string
): Promise<boolean>

// User tracking
export async function updateTimestamp(
  guildId: string,
  odId: string
): Promise<void>
```

## Library Design Principles

1. **Single Responsibility** - Each library handles one domain
2. **Async/Await** - All I/O operations are async
3. **Error Handling** - Return null/false on failure, log errors
4. **Type Safety** - Full TypeScript typing on all exports
5. **Stateless** - Libraries don't maintain internal state

## Adding New Library Functions

```typescript
// 1. Define function with proper types
export async function newFunction(
  param1: Type1,
  param2: Type2
): Promise<ReturnType> {
  try {
    // Implementation
    return result;
  } catch (error) {
    logger.error(`newFunction error: ${error}`);
    return null; // or appropriate error value
  }
}

// 2. Import in consuming files
import { newFunction } from "../libraries/myLibrary.library.ts";
```

## Common Imports

```typescript
// Discord.js types
import type { Guild, GuildMember, VoiceChannel } from "npm:discord.js";

// Internal types
import type { PGuild } from "../types/classes/PGuild.class.ts";
import type { PChannel } from "../types/classes/PPortalChannel.class.ts";

// Logger
import logger from "../utilities/log.utility.ts";
```

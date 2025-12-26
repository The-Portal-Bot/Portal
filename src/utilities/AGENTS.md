# AGENTS.md - Utilities Directory

## Directory Purpose

Utility functions and helpers used across the entire application. Currently focuses on logging infrastructure.

## Files

| File | Purpose |
|------|---------|
| `log.utility.ts` | Winston logger configuration |
| `log.utility.test.ts` | Logger tests |

## Agent Skills for Utilities

### 1. Logging
- Configure Winston transports
- Log levels (error, warn, info, debug)
- File and console output
- Structured logging

### 2. Testing
- Write unit tests with Deno
- Use @std/expect assertions
- Test utility functions

## Logger Usage

### Import
```typescript
import logger from "../utilities/log.utility.ts";
```

### Log Levels
```typescript
// Error - Critical failures
logger.error("Database connection failed", { error: err });

// Warn - Non-critical issues
logger.warn("Rate limit approaching", { remaining: 5 });

// Info - General information
logger.info("Command executed", { command: "ban", user: userId });

// Debug - Development details
logger.debug("Processing voice state", { oldState, newState });
```

### Structured Logging
```typescript
// Add context to logs
logger.info("Guild joined", {
  service: "discord",
  guildId: guild.id,
  guildName: guild.name,
  memberCount: guild.memberCount,
});
```

## Logger Configuration

### log.utility.ts
```typescript
import { createLogger, format, transports } from "npm:winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),
  ],
});

export default logger;
```

### File Transports (Production)
```typescript
// Added in app.ts when LOG=true
logger.add(
  new transports.File({
    filename: "/logs/portal-error.log.json",
    level: "error",
  })
);

logger.add(
  new transports.File({
    filename: "/logs/portal-info.log.json",
    level: "info",
  })
);

logger.add(
  new transports.File({
    filename: "/logs/portal-all.log.json",
  })
);
```

## Testing Pattern

### log.utility.test.ts
```typescript
import { expect } from "@std/expect";
import logger from "./log.utility.ts";

Deno.test("logger exists", () => {
  expect(logger).toBeDefined();
});

Deno.test("logger has expected methods", () => {
  expect(typeof logger.info).toBe("function");
  expect(typeof logger.error).toBe("function");
  expect(typeof logger.warn).toBe("function");
});
```

### Run Tests
```bash
deno test src/utilities/
```

## Adding New Utilities

### New Utility File
```typescript
// src/utilities/newutil.utility.ts

/**
 * Description of utility
 * @param param Description
 * @returns Description
 */
export function utilityFunction(param: Type): ReturnType {
  // Implementation
  return result;
}
```

### New Utility Test
```typescript
// src/utilities/newutil.utility.test.ts
import { expect } from "@std/expect";
import { utilityFunction } from "./newutil.utility.ts";

Deno.test("utilityFunction - basic case", () => {
  const result = utilityFunction(input);
  expect(result).toBe(expectedOutput);
});

Deno.test("utilityFunction - edge case", () => {
  const result = utilityFunction(edgeInput);
  expect(result).toBe(edgeExpectedOutput);
});
```

## Best Practices

1. **Keep utilities pure** - No side effects when possible
2. **Export default for singletons** - Like logger
3. **Named exports for functions** - Multiple utilities per file
4. **Write tests** - All utilities should have tests
5. **Document with JSDoc** - Clear parameter/return descriptions

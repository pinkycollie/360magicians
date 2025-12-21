# Shared Utilities

This directory contains shared code used across all MBTQ edge functions.

## Structure

### `types/` - TypeScript Type Definitions
Common interfaces and types used across services:
- `User` - User object structure
- `AuthToken` - Authentication token format
- `ApiLogEntry` - API logging format
- `TrustScore` - Fibonrose trust score
- `FibonroseEvent` - Event logging format
- `AIRequest` / `AIResponse` - AI service types
- `HealthCheck` - Health check response

### `utils/` - Utility Functions
Helper functions for common operations:
- `formatTimestamp()` - ISO timestamp formatting
- `calculateAverage()` - Calculate averages
- `isValidEmail()` - Email validation
- `clamp()` - Number clamping
- `generateId()` - UUID generation
- `hashString()` - SHA-256 hashing
- `getClientIP()` - Extract client IP from headers
- `getRegion()` - Get Deno Deploy region

### `middleware/` - Middleware Functions
Reusable middleware for Fresh apps:
- `corsMiddleware()` - CORS handling
- `rateLimitMiddleware()` - Rate limiting
- `timingMiddleware()` - Request timing
- `errorMiddleware()` - Error handling

## Usage

Import shared utilities in your edge functions:

```typescript
// Import types
import type { User, AuthToken } from "../../shared/types/index.ts";

// Import utilities
import { formatTimestamp, hashString } from "../../shared/utils/index.ts";

// Import middleware
import { corsMiddleware, rateLimitMiddleware } from "../../shared/middleware/index.ts";
```

## Development

When adding new shared code:
1. Add to appropriate directory
2. Export from `index.ts`
3. Update this README
4. Use across services to reduce duplication

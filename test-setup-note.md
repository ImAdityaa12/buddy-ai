# Testing Framework Setup

This project now uses **Vitest** as the testing framework.

## Required Dependencies

Add these to your package.json devDependencies:

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

## Install Commands

```bash
npm install -D vitest @vitest/ui
# or
yarn add -D vitest @vitest/ui
# or  
pnpm add -D vitest @vitest/ui
```

## Running Tests

```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI
```

The tests are comprehensive and cover:
- betterAuth initialization and configuration
- drizzleAdapter setup with PostgreSQL
- Schema validation and spread operations
- Email/password authentication configuration
- Error handling and edge cases
- Module exports validation
- Integration scenarios
- Provider-specific configurations
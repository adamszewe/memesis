# Testing Guide for Memesis

This document explains the testing strategy for preventing scroll position regressions.

## Test Structure

We have two layers of tests to ensure scroll position preservation works correctly:

### 1. Unit Tests (`src/components/__tests__/PostsList.test.tsx`)

Tests the PostsList component in isolation:
- ✅ Loads and displays posts on mount
- ✅ Restores posts from sessionStorage cache
- ✅ Caches posts to sessionStorage when loading
- ✅ Preserves component state when hidden with display:none

**Run with:**
```bash
npm test
```

### 2. Integration Tests (`src/__tests__/App.scroll.test.tsx`)

Tests the interaction between App components and scroll behavior:
- ✅ Prevents body overflow when on post detail page
- ✅ Restores body overflow when navigating back
- ✅ Correctly detects post detail routes
- ✅ Correctly detects home routes

**Run with:**
```bash
npm test
```

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
# Run all tests
npm test

# Watch mode (for development)
npm test -- --watch

# With UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm ci
          cd web && npm ci

      - name: Run tests
        run: cd web && npm test

      - name: Generate coverage report
        run: cd web && npm run test:coverage

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: coverage-report
          path: web/coverage/
```

## What These Tests Prevent

1. **PostsList Remounting**: Ensures the component doesn't unmount when navigating away
2. **Data Reloading**: Prevents unnecessary API calls when returning to the list
3. **State Loss**: Ensures loaded posts and page numbers are preserved via sessionStorage
4. **Body Scroll Management**: Verifies body overflow is properly toggled for overlay behavior
5. **Route Detection**: Ensures proper detection of post detail vs. home routes

## When to Run Tests

- **Before every commit**: Run tests (`npm test`)
- **Before every PR**: Run all tests with coverage
- **After navigation changes**: Run tests to verify behavior
- **In CI/CD**: Run all tests automatically

## Adding New Tests

When adding navigation or scroll-related features, add tests at both layers:

1. **Unit**: Test component behavior in isolation
2. **Integration**: Test how components interact and side effects like body overflow

## Debugging Failed Tests

```bash
# Run in watch mode
npm test -- --watch

# Run specific test file
npm test PostsList.test.tsx

# Run with UI (visual test runner)
npm run test:ui

# Run specific test by name pattern
npm test -- -t "should cache posts"

# See detailed output
npm test -- --reporter=verbose
```

## Test Maintenance

Update tests when:
- Changing navigation structure
- Modifying how posts are loaded/cached
- Updating the overlay implementation
- Changing body overflow management
- Modifying sessionStorage caching logic

## Current Test Coverage

- ✅ PostsList component state management
- ✅ SessionStorage caching and restoration
- ✅ Component mounting behavior
- ✅ Body overflow toggling for overlay
- ✅ Route detection logic

Future test considerations (if needed):
- Browser-based scroll position testing (E2E with Playwright)
- Visual regression testing
- Performance testing for large post lists

# @uistate/event-test

Event-sequence testing for [@uistate/core](https://www.npmjs.com/package/@uistate/core) with TDD-style assertions and type extraction.

> **License:** This package is under a proprietary license. Free for personal, open-source, and educational use. Commercial use requires a separate license — see [LICENSE.md](./LICENSE.md).

## Install

```bash
npm install @uistate/event-test
```

Requires `@uistate/core` >= 5.0.0 as a peer dependency.

## Usage

```js
import { createEventTest, test, runTests } from '@uistate/event-test';

const et = createEventTest({ count: 0, todos: [] });

test('counter increments', () => {
  et.trigger('count', 1)
    .assertPath('count', 1)
    .assertType('count', 'number');
});

test('todos array', () => {
  et.trigger('todos', [{ id: 1, text: 'Hello', done: false }])
    .assertArrayLength('todos', 1)
    .assertArrayOf('todos', { id: 'number', text: 'string', done: 'boolean' });
});

// Run all tests
runTests({
  'counter increments': () => { /* ... */ },
  'todos array': () => { /* ... */ },
});
```

## API

### `createEventTest(initialState)`
Creates a test harness wrapping an EventState store.

- **`trigger(path, value)`**: set state and chain
- **`assertPath(path, expected)`**: assert exact value
- **`assertType(path, expectedType)`**: assert `typeof`
- **`assertShape(path, shape)`**: assert object shape
- **`assertArrayOf(path, elementShape)`**: assert array element shape
- **`assertArrayLength(path, length)`**: assert array length
- **`assertEventFired(path, times)`**: assert event count
- **`getEventLog()`**: get full event log
- **`getTypeAssertions()`**: get type assertions (for code generation)

### `test(name, fn)` / `runTests(tests)`
Simple test runner with console output.

## Testing

Two-layer testing architecture:

**`self-test.js`** — Zero-dependency self-test (40 assertions). Runs automatically on `npm install` via `postinstall`. Verifies `createEventTest`, all assertion methods, `test()`, and `runTests()` on the consumer's machine.

```bash
node self-test.js
```

**`tests/event-test.test.js`** — Integration tests using `@uistate/event-test` itself (25 tests). The meta-test: eventTest testing eventTest.

```bash
npm test
```

| Suite | Assertions | Dependencies |
|-------|-----------|-------------|
| `self-test.js` | 40 | `@uistate/core` only |
| `tests/event-test.test.js` | 25 | `@uistate/event-test` |

## License

Proprietary — see [LICENSE.md](./LICENSE.md)

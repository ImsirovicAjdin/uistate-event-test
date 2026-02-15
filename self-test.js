/**
 * @uistate/event-test: zero-dependency self-test
 *
 * Tests createEventTest, test(), runTests(), and all assertion methods.
 * Runs on postinstall to verify the package works on the consumer's machine.
 */

import { createEventTest, test, runTests } from './index.js';

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${title}`);
}

// -- 1. createEventTest basics ---------------------------------------

section('1. createEventTest');

const t1 = createEventTest({ count: 0, name: 'Alice' });
assert('returns object with store', typeof t1.store === 'object');
assert('returns trigger method', typeof t1.trigger === 'function');
assert('returns assertPath method', typeof t1.assertPath === 'function');
assert('returns assertType method', typeof t1.assertType === 'function');
assert('returns assertShape method', typeof t1.assertShape === 'function');
assert('returns assertArrayOf method', typeof t1.assertArrayOf === 'function');
assert('returns assertArrayLength method', typeof t1.assertArrayLength === 'function');
assert('returns assertEventFired method', typeof t1.assertEventFired === 'function');
assert('returns getEventLog method', typeof t1.getEventLog === 'function');
assert('returns getTypeAssertions method', typeof t1.getTypeAssertions === 'function');

// -- 2. trigger + assertPath -----------------------------------------

section('2. trigger + assertPath');

const t2 = createEventTest({ count: 0 });
t2.trigger('count', 5);
assert('trigger sets value', t2.store.get('count') === 5);

let assertPathPassed = false;
try { t2.assertPath('count', 5); assertPathPassed = true; } catch {}
assert('assertPath passes on match', assertPathPassed);

let assertPathThrew = false;
try { t2.assertPath('count', 999); } catch { assertPathThrew = true; }
assert('assertPath throws on mismatch', assertPathThrew);

// -- 3. trigger chaining ---------------------------------------------

section('3. chaining');

const t3 = createEventTest({ a: 0, b: '' });
const chain = t3.trigger('a', 1).trigger('b', 'hello');
assert('trigger returns this (chainable)', chain === t3);

let chainAssert = false;
try { t3.trigger('a', 10).assertPath('a', 10); chainAssert = true; } catch {}
assert('assertPath returns this (chainable)', chainAssert);

// -- 4. assertType ---------------------------------------------------

section('4. assertType');

const t4 = createEventTest({ n: 42, s: 'hello', b: true });
let typeOk = false;
try { t4.assertType('n', 'number').assertType('s', 'string').assertType('b', 'boolean'); typeOk = true; } catch {}
assert('assertType passes for correct types', typeOk);

let typeThrew = false;
try { t4.assertType('n', 'string'); } catch { typeThrew = true; }
assert('assertType throws on wrong type', typeThrew);

// -- 5. assertShape --------------------------------------------------

section('5. assertShape');

const t5 = createEventTest({ user: { name: 'Alice', age: 30 } });
let shapeOk = false;
try { t5.assertShape('user', { name: 'string', age: 'number' }); shapeOk = true; } catch {}
assert('assertShape passes for matching shape', shapeOk);

let shapeMissing = false;
try { t5.assertShape('user', { name: 'string', email: 'string' }); } catch { shapeMissing = true; }
assert('assertShape throws on missing property', shapeMissing);

let shapeWrongType = false;
try { t5.assertShape('user', { name: 'number' }); } catch { shapeWrongType = true; }
assert('assertShape throws on wrong property type', shapeWrongType);

let shapeNotObj = false;
try { t5.assertShape('user.name', { x: 'string' }); } catch { shapeNotObj = true; }
assert('assertShape throws on non-object', shapeNotObj);

// -- 6. assertArrayOf + assertArrayLength ----------------------------

section('6. assertArrayOf + assertArrayLength');

const t6 = createEventTest({ items: [{ id: 1, text: 'a' }, { id: 2, text: 'b' }] });
let arrOfOk = false;
try { t6.assertArrayOf('items', { id: 'number', text: 'string' }); arrOfOk = true; } catch {}
assert('assertArrayOf passes for matching element shape', arrOfOk);

let arrLenOk = false;
try { t6.assertArrayLength('items', 2); arrLenOk = true; } catch {}
assert('assertArrayLength passes for correct length', arrLenOk);

let arrLenThrew = false;
try { t6.assertArrayLength('items', 5); } catch { arrLenThrew = true; }
assert('assertArrayLength throws on wrong length', arrLenThrew);

let arrOfNotArr = false;
try {
  const t6b = createEventTest({ x: 'not-array' });
  t6b.assertArrayOf('x', { a: 'string' });
} catch { arrOfNotArr = true; }
assert('assertArrayOf throws on non-array', arrOfNotArr);

// -- 7. assertEventFired ---------------------------------------------

section('7. assertEventFired');

const t7 = createEventTest({ x: 0 });
t7.trigger('x', 1);
t7.trigger('x', 2);
let firedOk = false;
try { t7.assertEventFired('x', 2); firedOk = true; } catch {}
assert('assertEventFired passes for correct count', firedOk);

let firedThrew = false;
try { t7.assertEventFired('x', 10); } catch { firedThrew = true; }
assert('assertEventFired throws on wrong count', firedThrew);

// -- 8. getEventLog --------------------------------------------------

section('8. getEventLog');

const t8 = createEventTest({ a: 0 });
t8.trigger('a', 1);
t8.trigger('a', 2);
const log = t8.getEventLog();
assert('getEventLog returns array', Array.isArray(log));
assert('getEventLog has correct length', log.length >= 2);
assert('getEventLog entries have path', log[0].path === 'a');
assert('getEventLog entries have value', log[0].value === 1);
assert('getEventLog entries have timestamp', typeof log[0].timestamp === 'number');

// -- 9. getTypeAssertions --------------------------------------------

section('9. getTypeAssertions');

const t9 = createEventTest({ count: 0, items: [{ id: 1 }] });
t9.assertType('count', 'number');
t9.assertArrayOf('items', { id: 'number' });
const types = t9.getTypeAssertions();
assert('getTypeAssertions returns array', Array.isArray(types));
assert('getTypeAssertions has 2 entries', types.length === 2);
assert('first entry is type assertion', types[0].type === 'number' && types[0].path === 'count');
assert('second entry is array assertion', types[1].type === 'array' && types[1].path === 'items');

// -- 10. test() function ---------------------------------------------

section('10. test() function');

// Capture console output
const origLog = console.log;
const origErr = console.error;
let captured = [];
console.log = (...args) => captured.push(args.join(' '));
console.error = (...args) => captured.push(args.join(' '));

const testPass = test('passing test', () => { /* no throw */ });
assert('test() returns true for passing test', testPass === true);

const testFail = test('failing test', () => { throw new Error('oops'); });
assert('test() returns false for failing test', testFail === false);

console.log = origLog;
console.error = origErr;

// -- 11. runTests() function -----------------------------------------

section('11. runTests()');

captured = [];
console.log = (...args) => captured.push(args.join(' '));
console.error = (...args) => captured.push(args.join(' '));

const results = runTests({
  'should pass': () => {},
  'should fail': () => { throw new Error('nope'); },
  'should also pass': () => {},
});

console.log = origLog;
console.error = origErr;

assert('runTests returns passed count', results.passed === 2);
assert('runTests returns failed count', results.failed === 1);

// -- Summary ---------------------------------------------------------

console.log(`\n@uistate/event-test v1.0.0 self-test`);
if (failed > 0) {
  console.error(`✗ ${failed} assertion(s) failed, ${passed} passed`);
  process.exit(1);
} else {
  console.log(`✓ ${passed} assertions passed`);
}

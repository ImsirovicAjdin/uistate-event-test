/**
 * @uistate/event-test: integration tests (using itself to test itself)
 *
 * This is the meta-test: eventTest testing eventTest via runTests.
 */

import { createEventTest, runTests } from '@uistate/event-test';

const results = runTests({

  // -- createEventTest -----------------------------------------------

  'createEventTest: initializes store with state': () => {
    const t = createEventTest({ x: 10 });
    t.assertPath('x', 10);
  },

  'createEventTest: empty initial state': () => {
    const t = createEventTest({});
    t.trigger('new.path', 'value');
    t.assertPath('new.path', 'value');
  },

  // -- trigger + assertPath ------------------------------------------

  'trigger: sets value in store': () => {
    const t = createEventTest({ count: 0 });
    t.trigger('count', 42);
    t.assertPath('count', 42);
  },

  'trigger: chaining multiple triggers': () => {
    const t = createEventTest({ a: 0, b: 0 });
    t.trigger('a', 1).trigger('b', 2);
    t.assertPath('a', 1);
    t.assertPath('b', 2);
  },

  'assertPath: deep equality for objects': () => {
    const t = createEventTest({ user: { name: 'Alice', age: 30 } });
    t.assertPath('user', { name: 'Alice', age: 30 });
  },

  'assertPath: deep equality for arrays': () => {
    const t = createEventTest({ items: [1, 2, 3] });
    t.assertPath('items', [1, 2, 3]);
  },

  // -- assertType ----------------------------------------------------

  'assertType: number': () => {
    const t = createEventTest({ n: 42 });
    t.assertType('n', 'number');
  },

  'assertType: string': () => {
    const t = createEventTest({ s: 'hello' });
    t.assertType('s', 'string');
  },

  'assertType: boolean': () => {
    const t = createEventTest({ b: true });
    t.assertType('b', 'boolean');
  },

  'assertType: object': () => {
    const t = createEventTest({ o: { x: 1 } });
    t.assertType('o', 'object');
  },

  // -- assertShape ---------------------------------------------------

  'assertShape: flat object': () => {
    const t = createEventTest({ user: { name: 'Bob', age: 25 } });
    t.assertShape('user', { name: 'string', age: 'number' });
  },

  'assertShape: nested object': () => {
    const t = createEventTest({ config: { db: { host: 'localhost', port: 5432 } } });
    t.assertShape('config.db', { host: 'string', port: 'number' });
  },

  // -- assertArrayOf -------------------------------------------------

  'assertArrayOf: validates element shape': () => {
    const t = createEventTest({ todos: [{ id: 1, text: 'Buy milk', done: false }] });
    t.assertArrayOf('todos', { id: 'number', text: 'string', done: 'boolean' });
  },

  'assertArrayOf: empty array passes': () => {
    const t = createEventTest({ items: [] });
    t.assertArrayOf('items', { id: 'number' });
  },

  // -- assertArrayLength ---------------------------------------------

  'assertArrayLength: correct length': () => {
    const t = createEventTest({ items: ['a', 'b', 'c'] });
    t.assertArrayLength('items', 3);
  },

  'assertArrayLength: empty array': () => {
    const t = createEventTest({ items: [] });
    t.assertArrayLength('items', 0);
  },

  // -- assertEventFired ----------------------------------------------

  'assertEventFired: counts triggers': () => {
    const t = createEventTest({ x: 0 });
    t.trigger('x', 1);
    t.trigger('x', 2);
    t.trigger('x', 3);
    t.assertEventFired('x', 3);
  },

  'assertEventFired: zero fires for untouched path': () => {
    const t = createEventTest({ a: 0, b: 0 });
    t.trigger('a', 1);
    t.assertEventFired('b', 0);
  },

  // -- getEventLog ---------------------------------------------------

  'getEventLog: records all events': () => {
    const t = createEventTest({ x: 0 });
    t.trigger('x', 1);
    t.trigger('x', 2);
    const log = t.getEventLog();
    if (log.length < 2) throw new Error(`Expected at least 2 log entries, got ${log.length}`);
    if (log[0].path !== 'x') throw new Error('First entry path should be x');
    if (log[0].value !== 1) throw new Error('First entry value should be 1');
  },

  'getEventLog: returns a copy (not mutable)': () => {
    const t = createEventTest({ x: 0 });
    t.trigger('x', 1);
    const log1 = t.getEventLog();
    const log2 = t.getEventLog();
    if (log1 === log2) throw new Error('getEventLog should return a new array each time');
  },

  // -- getTypeAssertions ---------------------------------------------

  'getTypeAssertions: collects type assertions': () => {
    const t = createEventTest({ count: 0, name: 'Alice' });
    t.assertType('count', 'number');
    t.assertType('name', 'string');
    const types = t.getTypeAssertions();
    if (types.length !== 2) throw new Error(`Expected 2 type assertions, got ${types.length}`);
  },

  'getTypeAssertions: collects array assertions': () => {
    const t = createEventTest({ items: [{ id: 1 }] });
    t.assertArrayOf('items', { id: 'number' });
    const types = t.getTypeAssertions();
    if (types[0].type !== 'array') throw new Error('Expected type=array');
    if (!types[0].elementShape) throw new Error('Expected elementShape');
  },

  'getTypeAssertions: collects shape assertions': () => {
    const t = createEventTest({ user: { name: 'Alice' } });
    t.assertShape('user', { name: 'string' });
    const types = t.getTypeAssertions();
    if (types[0].type !== 'object') throw new Error('Expected type=object');
    if (!types[0].shape) throw new Error('Expected shape');
  },

  // -- full workflow -------------------------------------------------

  'workflow: trigger → assert → type → event count': () => {
    const t = createEventTest({ count: 0, user: { name: 'Alice' } });
    t.trigger('count', 1)
      .assertPath('count', 1)
      .assertType('count', 'number')
      .assertEventFired('count', 1);
    t.trigger('user.name', 'Bob')
      .assertPath('user.name', 'Bob')
      .assertType('user.name', 'string');
  },

  'workflow: store access for batch/setMany': () => {
    const t = createEventTest({ a: 0, b: 0 });
    t.store.batch(() => {
      t.trigger('a', 1);
      t.trigger('b', 2);
    });
    t.assertPath('a', 1);
    t.assertPath('b', 2);
  },
});

if (results.failed > 0) process.exit(1);

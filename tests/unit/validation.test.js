// Unit tests check ONE small piece on its own, like testing a single
// Lego brick before building the whole castle.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTodoText,
  validateCompleted,
  validateTodoId,
  validateCompletedFilter,
} from '../../lib/validation.js';

describe('checking todo text', () => {
  it('rejects an empty todo', () => {
    const result = validateTodoText('');
    assert.equal(result.ok, false);
  });

  it('rejects a todo that is only spaces', () => {
    const result = validateTodoText('    ');
    assert.equal(result.ok, false);
  });

  it('rejects a todo longer than 200 characters', () => {
    const result = validateTodoText('a'.repeat(201));
    assert.equal(result.ok, false);
  });

  it('accepts a todo that is exactly 200 characters', () => {
    const result = validateTodoText('a'.repeat(200));
    assert.equal(result.ok, true);
  });

  it('counts an emoji as one character', () => {
    const result = validateTodoText('🐶'.repeat(200));
    assert.equal(result.ok, true);
  });

  it('removes extra spaces from the start and end', () => {
    const result = validateTodoText('   feed the cat   ');
    assert.deepEqual(result, { ok: true, value: 'feed the cat' });
  });

  it('rejects something that is not text, like a number', () => {
    const result = validateTodoText(42);
    assert.equal(result.ok, false);
  });
});

describe('checking the "completed" value', () => {
  it('accepts true and false', () => {
    assert.equal(validateCompleted(true).ok, true);
    assert.equal(validateCompleted(false).ok, true);
  });

  it('rejects the word "yes"', () => {
    assert.equal(validateCompleted('yes').ok, false);
  });
});

describe('checking a todo id from the URL', () => {
  it('turns "7" into the number 7', () => {
    assert.deepEqual(validateTodoId('7'), { ok: true, value: 7 });
  });

  it('rejects words, zero and negative numbers', () => {
    assert.equal(validateTodoId('abc').ok, false);
    assert.equal(validateTodoId('0').ok, false);
    assert.equal(validateTodoId('-3').ok, false);
    assert.equal(validateTodoId('1.5').ok, false);
  });
});

describe('checking the ?completed= filter', () => {
  it('understands "true", "false" and no filter at all', () => {
    assert.deepEqual(validateCompletedFilter('true'), { ok: true, value: true });
    assert.deepEqual(validateCompletedFilter('false'), { ok: true, value: false });
    assert.deepEqual(validateCompletedFilter(undefined), { ok: true, value: undefined });
  });

  it('rejects anything else, like "banana"', () => {
    assert.equal(validateCompletedFilter('banana').ok, false);
  });
});

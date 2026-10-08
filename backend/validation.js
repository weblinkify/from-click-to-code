// validation.js
// "Validation" means checking that what someone sent us makes sense
// BEFORE we use it, like a teacher checking a form is filled in.
//
// Each function returns either:
//   { ok: true,  value: <the cleaned-up value> }
//   { ok: false, error: <a friendly message> }

const MAX_TODO_LENGTH = 200;

// Count characters the way people do, so an emoji like 🐶 counts as 1.
function countCharacters(text) {
  return Array.from(text).length;
}

function validateTodoText(input) {
  if (typeof input !== 'string') {
    return { ok: false, error: 'Todo text must be words.' };
  }

  // trim() removes spaces at the start and end: "  feed cat  " -> "feed cat"
  const text = input.trim();

  if (text.length === 0) {
    return { ok: false, error: 'Please write something for your todo.' };
  }

  if (countCharacters(text) > MAX_TODO_LENGTH) {
    return {
      ok: false,
      error: `A todo can be at most ${MAX_TODO_LENGTH} characters long.`,
    };
  }

  return { ok: true, value: text };
}

function validateCompleted(input) {
  if (typeof input !== 'boolean') {
    return { ok: false, error: 'completed must be true or false.' };
  }
  return { ok: true, value: input };
}

// Turns the "7" in /todos/7 into the number 7.
// Anything that is not a whole number above 0 is rejected.
function validateTodoId(input) {
  if (!/^[0-9]+$/.test(input)) {
    return { ok: false, error: 'That todo id is not a number.' };
  }
  const id = Number(input);
  if (!Number.isSafeInteger(id) || id < 1) {
    return { ok: false, error: 'That todo id is not a number.' };
  }
  return { ok: true, value: id };
}

// For GET /todos?completed=true. The value in a URL is always text,
// so we turn "true" / "false" into real true / false.
function validateCompletedFilter(input) {
  if (input === undefined) {
    return { ok: true, value: undefined };
  }
  if (input === 'true') {
    return { ok: true, value: true };
  }
  if (input === 'false') {
    return { ok: true, value: false };
  }
  return { ok: false, error: 'completed must be "true" or "false".' };
}

module.exports = {
  MAX_TODO_LENGTH,
  validateTodoText,
  validateCompleted,
  validateTodoId,
  validateCompletedFilter,
};

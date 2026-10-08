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

// Usernames: 3 to 30 letters, numbers, "_" or "-". No spaces.
function validateUsername(input) {
  if (typeof input !== 'string') {
    return { ok: false, error: 'Please choose a username.' };
  }
  const username = input.trim();
  if (!/^[A-Za-z0-9_-]{3,30}$/.test(username)) {
    return {
      ok: false,
      error: 'Usernames need 3 to 30 letters or numbers (you can also use _ and -).',
    };
  }
  return { ok: true, value: username };
}

// Passwords: at least 8 characters. We do NOT trim passwords:
// spaces can be part of a good password!
// bcrypt only looks at the first 72 bytes, so we stop there.
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

function validatePassword(input) {
  if (typeof input !== 'string' || input.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Passwords need at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (Buffer.byteLength(input, 'utf8') > MAX_PASSWORD_BYTES) {
    return { ok: false, error: 'That password is too long.' };
  }
  return { ok: true, value: input };
}

module.exports = {
  MAX_TODO_LENGTH,
  validateUsername,
  validatePassword,
  validateTodoText,
  validateCompleted,
  validateTodoId,
  validateCompletedFilter,
};

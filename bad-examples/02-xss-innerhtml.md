# 2 · Todo text put on the page with `innerHTML` (XSS)

## The bad version ❌

```js
// DON'T DO THIS
function showTodo(todo) {
  const item = document.createElement('li');
  item.innerHTML = todo.text;
  list.appendChild(item);
}
```

🔍 **Before reading on:** what does `innerHTML` do with `<b>Hi</b>`?

## What could go wrong

`innerHTML` tells the browser: *"treat this text as HTML code and build it."*
So if a todo says `<b>Hi</b>`, you'd see **Hi** in bold instead of the letters
`<b>Hi</b>`.

That sounds fun, until someone types something sneakier. A harmless demo:

```html
<img src="nope" onerror="alert('hi')">
```

The browser tries to load a picture called "nope", fails, and then **runs the
code** in `onerror`. Here it only pops up "hi". A real attacker could run code
that reads the page, or sends requests pretending to be you.

This is called **XSS (Cross-Site Scripting)**: sneaking a script onto a page.
It's like a sticker on a notice board that, when you read it, makes you do
whatever it says.

## The fix ✅

Use `textContent`. It means *"these are just letters, show them as they are."*

```js
function showTodo(todo) {
  const item = document.createElement('li');
  item.textContent = todo.text;
  list.appendChild(item);
}
```

Now the page shows the exact letters `<img src="nope" ...>`, and nothing runs.

**In React** (which our app uses), `{todo.text}` does this automatically: React
always shows text as plain letters. The React way to make this mistake is a
prop with a scary name on purpose: `dangerouslySetInnerHTML`. Our test makes
sure it never appears in our code.

👉 See the real code: [`components/TodoItem.js`](../components/TodoItem.js).
We also have a second safety net: the Content-Security-Policy in
[`proxy.js`](../proxy.js) tells the browser to run only scripts carrying a secret
"nonce" that changes on every visit.
Tests: [`tests/security/xss.test.js`](../tests/security/xss.test.js) and the
Playwright tests in [`tests/e2e/happy-path.spec.js`](../tests/e2e/happy-path.spec.js)
and [`tests/e2e/course.spec.js`](../tests/e2e/course.spec.js).

Try it safely in the app's security lab: **http://localhost:3000/course/security**.

**Review rule:** `innerHTML` or `dangerouslySetInnerHTML` with user text is almost
always a bug. Use `textContent`, or just `{text}` in React.

# Lesson 4 · What happens when you click a link? 🖱️

You type `localhost:3000` and press Enter. Less than a second later, a page
appears. But in that blink, a whole journey happened! Let's slow it down.

It's like **sending a letter and getting a reply**:

1. You write the address on the envelope (**the URL**).
2. The post office looks up where that address really is (**DNS**).
3. The letter travels there (**the network**).
4. Someone at that house reads it and writes back (**the server**).
5. The reply comes back to your letterbox (**your browser**).

```
   YOU (browser)                                          SERVER (our app)
  ┌──────────────┐   1. "Where is example.com?"   ┌─────┐
  │              │ ─────────────────────────────> │ DNS │
  │              │ <───── "It's at 93.184.x.x" ── └─────┘
  │              │
  │              │   2. GET /my-todos  ─────────────────────>  ┌──────────────┐
  │              │                                           │ Next.js      │
  │              │   3.  <─────── 200 OK + the HTML ──────── │ builds the   │
  │              │                                           │ page, sends  │
  │  4. reads    │   5. GET the CSS and JavaScript ────────> │ it           │
  │  HTML, sees  │      <──────────── the files ──────────── │              │
  │  it needs    │                                           │              │
  │  more files  │   6. React starts: GET /todos ──────────> │ asks the     │
  │              │      <──── {"todos":[...]} ────────────── │ database     │
  │  7. draws    │                                           └──────────────┘
  │  the page 🎉 │
  └──────────────┘
```

## The steps, one by one

1. **DNS lookup.** Computers find each other with numbers called **IP
   addresses** (like `93.184.216.34`). Names like `example.com` are for
   humans. **DNS** (*Domain Name System*) is the internet's phone book that
   turns names into numbers. (`localhost` is special: it always means
   *"this very computer"*.)
2. **The request.** Your browser sends a **request**: a short message saying
   *"GET me /my-todos please."*
3. **The response.** The server sends back a **response** with a **status
   code** (200 means "OK!") and the page.
4. **More requests.** The HTML says *"I also need these CSS and JavaScript
   files"*, so the browser asks for those too.
5. **JavaScript runs.** React wakes up the page and asks the server for
   *your* todos.
6. **The page appears**, built from all the pieces.

## Where this happens in the project

- **Next.js** is the framework that runs our server. `npm run dev` (or
  `docker compose up`) starts it listening on port 3000, waiting for requests.
  When it starts, [`instrumentation.js`](../instrumentation.js) writes
  "server started" in the logs.
- [`proxy.js`](../proxy.js): runs first for every page, adding safety
  instructions (more in [Lesson 8](08-security.md)).
- [`lib/api.js`](../lib/api.js): the list of stops every API request passes
  through. Read the diagram at the top! It also writes one line in the log for
  every request, so you can watch the journey.

## New words

- **Request**: a message from the browser asking for something.
- **Response**: the server's reply.
- **Server**: a computer (or program) that waits for requests and answers them.
- **IP address**: the number that identifies a computer on a network.
- **DNS**: the phone book that turns names into IP addresses.
- **localhost**: a name that means "this computer".

## Questions

1. Why does opening one page cause *several* requests?
   <details><summary>Answer</summary>
   The HTML page asks for other files it needs, like the CSS and the
   JavaScript. Then the JavaScript asks for the todo data. Each one is its own
   request.
   </details>

2. What does DNS do?
   <details><summary>Answer</summary>
   It turns a name people can remember (like <code>example.com</code>) into the
   number address (IP address) computers use to find each other.
   </details>

## 🛠️ Mini challenge

1. Open http://localhost:3000/my-todos (log in first).
2. Open **DevTools** (right-click → Inspect) and click the **Network** tab.
3. Refresh the page.
4. Count the requests! Can you find `my-todos` (the page), some `.css` and
   `.js` files (their names are long and jumbled: Next.js does that so
   browsers can remember them safely), `me` and `todos`? Click one and look
   for its **Status Code**.
5. Bonus: look at the terminal running the app. Each API request (`me`,
   `todos`) wrote a line there. Can you match them up using the
   **X-Request-Id**?

---
[← Lesson 3](03-ui.md) · Next: [Lesson 5 · URL parts →](05-url-parts.md)

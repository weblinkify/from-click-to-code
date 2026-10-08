# Lesson 5 · The parts of a URL 🔗

A **URL** (*Uniform Resource Locator*) is a web address. It looks like one long
jumble, but every piece has a job, just like a postal address has a country,
city, street and house number.

```
   https://todos.example.com:443/todos?completed=true#top
   └─┬─┘   └───────┬───────┘ └┬┘└──┬─┘└──────┬──────┘└┬─┘
  scheme         host       port  path     query   fragment
```

| Part | Example | What it means | Postal address |
|------|---------|---------------|----------------|
| **Scheme** | `https` | *How* to talk: the rules to use | "Send by Royal Mail" |
| **Host** | `todos.example.com` | *Which computer* | The town and street |
| **Port** | `443` | *Which door* on that computer | The flat number |
| **Path** | `/todos` | *Which thing* you want | The person's name |
| **Query** | `?completed=true` | *Extra details* | "Please, only the red ones" |
| **Fragment** | `#top` | A spot *on* the page (never sent to the server) | "Read page 3 first" |

> 🖥️ **Prefer clicking to reading?** With the app running, open the interactive version of this lesson at **http://localhost:3000/course/url**.

## Our app's URLs

When you run the app on your computer:

```
  http://localhost:3000/todos?completed=true
  └┬─┘   └───┬───┘ └┬─┘└─┬──┘└──────┬──────┘
  scheme    host   port path      query
```

- **`localhost`** = this computer.
- **`3000`** = the door our app listens at. See `port` in
  [`lib/config.js`](../lib/config.js). Change `PORT` in your `.env`
  and the door number changes!
- **`/todos`** = the list of todos. Each path is handled by a route in
  [`app/todos/route.js`](../app/todos/route.js).
- **`?completed=true`** = "only the finished ones, please". The code that reads
  it is `validateCompletedFilter` in [`lib/validation.js`](../lib/validation.js).

## Paths with numbers in them

`/todos/7` means *"the todo whose id is 7"*. In the code, the route is written
`/:id`. The colon means *"any value goes here, call it id"*, a bit like a
blank on a form.

## New words

- **URL**: a web address.
- **Scheme**: the set of rules for talking (`http` or `https`).
- **Host / domain**: the name of the computer.
- **Port**: a numbered door on a computer. One computer can run many
  programs, each on its own port.
- **Path**: which page or thing on that computer.
- **Query string**: extra details after the `?`, written as `name=value`
  pairs joined with `&`.

## Questions

1. In `http://localhost:3000/todos/5`, what is the path?
   <details><summary>Answer</summary><code>/todos/5</code>: the todo with id 5.</details>

2. What does `?completed=false` ask for?
   <details><summary>Answer</summary>Only the todos that are <b>not</b> done yet.</details>

3. Why would you never see the `#fragment` part in our server's logs?
   <details><summary>Answer</summary>
   The browser keeps the fragment to itself. It's only used to jump to a spot
   on the page, and it's never sent to the server.
   </details>

## 🛠️ Mini challenge

Log in, add a couple of todos, tick one off. Then type these straight into
the address bar and compare what you see:

1. http://localhost:3000/todos
2. http://localhost:3000/todos?completed=true
3. http://localhost:3000/todos?completed=banana 🍌

Number 3 gives a **400** answer. Find the friendly message it shows inside
[`lib/validation.js`](../lib/validation.js). Now click the **To do**
and **Done** buttons on the todos page with the **Network** tab open: which
URLs do they ask for?

---
[← Lesson 4](04-what-happens-when-you-click.md) · Next: [Lesson 6 · HTTP vs HTTPS →](06-http-vs-https.md)

# 5 · A secret key written in the code

## The bad version ❌

```js
// DON'T DO THIS
const WEATHER_API_KEY = 'pretend-key-1234-this-is-not-real';

async function getWeather(city) {
  const url = 'https://weather.example.com/today?city=' + city +
    '&key=' + WEATHER_API_KEY;
  return fetch(url);
}
```

(The key above is made up. Real keys look like long random letters.)

🔍 **Before reading on:** this code works. Why would a reviewer still say no?

## What could go wrong

An **API key** is like a password that lets *our app* use someone else's
service, and the bill comes to us.

When the key is written in the code, it gets saved in Git. Push to GitHub,
and now it's in the history **forever**, even if you delete it later. Robots
scan GitHub all day looking for keys like this. Someone could use our key to
run up a huge bill, or get us blocked.

It's like writing your locker combination on the outside of your homework.

## The fix ✅

1. Keep secrets in **environment variables**, read by
   [`lib/config.js`](../lib/config.js).
2. Locally, put them in a `.env` file, which is listed in
   [`.gitignore`](../.gitignore) so Git never saves it.
3. Share a **template** without real values:
   [`.env.example`](../.env.example).
4. In the cloud, use the hosting service's **secret store**.

```js
// config.js
const weatherApiKey = process.env.WEATHER_API_KEY;
if (!weatherApiKey) {
  throw new Error('WEATHER_API_KEY is not set. See .env.example');
}
```

**If a key ever leaks:** deleting it from the code is *not enough*. Go to the
service and **revoke** (cancel) the key, then make a new one.

👉 See how our app reads `SESSION_SECRET` in [`lib/config.js`](../lib/config.js).

**Review rule:** look for long random strings, `key`, `token`, `secret`,
`password` in the code. They belong in `.env`.

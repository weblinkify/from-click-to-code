'use client';
// components/ServerDownBanner.js
// The yellow strip that appears when the server can't be reached.
//
// "use client" (the line at the top) means this component runs in the
// BROWSER, because it needs to react to things happening on the page.
//
// It listens for the news announced by lib/api-client.js.

import { useEffect, useState } from 'react';
import { SERVER_STATUS_EVENT } from '../lib/api-client.js';

export default function ServerDownBanner() {
  // "state" is a value React remembers. When it changes, React redraws.
  const [isDown, setIsDown] = useState(false);

  // useEffect runs once the component is on the page.
  useEffect(() => {
    // When the news arrives, remember whether the server is down.
    function onStatus(event) {
      setIsDown(event.detail.isDown);
    }
    window.addEventListener(SERVER_STATUS_EVENT, onStatus);
    // When the component goes away, stop listening (tidy up after ourselves).
    return () => window.removeEventListener(SERVER_STATUS_EVENT, onStatus);
  }, []);

  // Server is fine? Show nothing at all.
  if (!isDown) {
    return null;
  }
  return (
    <div
      className="banner fixed inset-x-4 top-4 z-50 mx-auto max-w-xl rounded-xl border-2 border-amber-300 bg-amber-100 px-5 py-3 font-bold text-amber-900 shadow-lg"
      role="alert"
    >
      😴 The server is taking a nap and we can&apos;t reach it. Please try again in a minute.
    </div>
  );
}

'use client';
// components/AccountForm.js
// One username + password form. The login page uses it twice:
// once for "Log in" and once for "Sign up".

import { useState } from 'react';

export default function AccountForm({ idPrefix, title, usernameLabel, passwordLabel, buttonLabel, isNewAccount, onSubmit }) {
  // React remembers what's typed in each box.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    // Stop the browser from reloading the page (that's what forms do by default).
    event.preventDefault();
    // Hand the username and password to the page, which talks to the server.
    onSubmit(username, password);
  }

  return (
    <section>
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor={`${idPrefix}-username`}>{usernameLabel}</label>
        <input
          id={`${idPrefix}-username`}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
          minLength={isNewAccount ? 3 : undefined}
          maxLength={isNewAccount ? 30 : undefined}
        />

        <label htmlFor={`${idPrefix}-password`}>{passwordLabel}</label>
        <input
          id={`${idPrefix}-password`}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isNewAccount ? 'new-password' : 'current-password'}
          required
          minLength={isNewAccount ? 8 : undefined}
        />

        <button type="submit">{buttonLabel}</button>
      </form>
    </section>
  );
}

'use client';
// app/login/page.js  ->  http://localhost:3000/login
// Two forms: "Log in" for people who already have an account,
// and "Sign up" for people who are new.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AccountForm from '../../components/AccountForm.js';
import Message from '../../components/Message.js';
import { callApi, errorFrom, ServerDownError } from '../../lib/api-client.js';

export default function LoginPage() {
  // useRouter lets us move to another page from our code.
  const router = useRouter();
  const [message, setMessage] = useState('');

  // Send the username and password to /auth/login or /auth/signup.
  async function sendAccountForm(path, username, password) {
    try {
      const result = await callApi('POST', path, { username, password });
      // Didn't work? Show the server's friendly reason (e.g. wrong password).
      if (!result.ok) {
        setMessage(errorFrom(result));
        return;
      }
      // It worked! The server gave us a session cookie. Go to the todos.
      router.push('/my-todos');
    } catch (error) {
      // Server down? The yellow banner is already showing.
      if (!(error instanceof ServerDownError)) {
        throw error;
      }
    }
  }

  return (
    <main className="card">
      <p>
        <Link href="/">← Home</Link>
      </p>
      <h1>Welcome!</h1>

      <Message text={message} />

      <AccountForm
        idPrefix="login"
        title="Log in"
        usernameLabel="Username"
        passwordLabel="Password"
        buttonLabel="Log in"
        onSubmit={(username, password) => sendAccountForm('/auth/login', username, password)}
      />

      <AccountForm
        idPrefix="signup"
        title="New here? Sign up"
        usernameLabel="Pick a username"
        passwordLabel="Pick a password (at least 8 characters)"
        buttonLabel="Sign up"
        isNewAccount
        onSubmit={(username, password) => sendAccountForm('/auth/signup', username, password)}
      />
    </main>
  );
}

import { FormEvent, useState } from "react";

import { loginUser, saveToken, User } from "../services/api";

type Props = {
  onLogin: (user: User) => void;
};

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const response = await loginUser({ email, password });
      saveToken(response.access_token);
      onLogin(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <form className="auth-panel" onSubmit={submit}>
      <h1>Sign in</h1>
      <label>
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
      </label>
      <label>
        Password
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}


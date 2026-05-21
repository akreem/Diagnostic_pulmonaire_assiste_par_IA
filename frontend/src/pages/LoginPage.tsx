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
      setError(err instanceof Error ? err.message : "Échec de la connexion");
    }
  }

  return (
    <form className="evax-login-card" onSubmit={submit}>
      <div className="evax-login-topline">
        <span>Français</span>
        <span>Arabe</span>
      </div>

      <div className="evax-login-title">
        <span className="evax-login-logo">IA</span>
        <p>Espace professionnel</p>
        <h1>Connexion</h1>
      </div>

      <label>
        Adresse e-mail
        <input
          autoComplete="email"
          placeholder="nom@hopital.tn"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
        />
      </label>
      <label>
        Mot de passe
        <input
          autoComplete="current-password"
          placeholder="Mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="evax-login-button" type="submit">Se connecter</button>

      <div className="evax-login-footer">
        <span>Assistance technique</span>
        <strong>Diagnostic IA</strong>
      </div>
    </form>
  );
}

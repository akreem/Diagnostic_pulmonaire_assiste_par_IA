import { FormEvent, useState } from "react";
import { z } from "zod";

import { registerUser, User } from "../services/api";

const registrationSchema = z.object({
  email: z.string().email("Saisissez une adresse e-mail valide"),
  full_name: z.string().min(2, "Le nom complet est obligatoire"),
  password: z.string().min(10, "Utilisez au moins 10 caractères"),
  role: z.enum(["doctor", "technician", "admin"])
});

type Props = {
  onRegistered: () => void;
  mode?: "setup" | "admin";
};

export function RegisterPage({ onRegistered, mode = "admin" }: Props) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>(mode === "setup" ? "admin" : "doctor");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isSetup = mode === "setup";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const parsed = registrationSchema.safeParse({
      email,
      full_name: fullName,
      password,
      role
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    try {
      await registerUser(parsed.data);
      setEmail("");
      setFullName("");
      setPassword("");
      setRole(isSetup ? "admin" : "doctor");
      setMessage(isSetup ? "Compte administrateur créé. Vous pouvez vous connecter." : "Compte créé.");
      onRegistered();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la création du compte");
    }
  }

  return (
    <form className="auth-panel" onSubmit={submit}>
      <h1>{isSetup ? "Initialiser l'administrateur" : "Créer un utilisateur"}</h1>
      <p className="form-note">
        {isSetup
          ? "Aucun compte administrateur n'existe encore. Créez le premier administrateur pour activer le système."
          : "Ajoutez un utilisateur médical autorisé à accéder à l'espace de diagnostic."}
      </p>
      <label>
        Adresse e-mail
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
      </label>
      <label>
        Nom complet
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
      </label>
      {isSetup ? (
        <div className="readonly-field">
          <span>Rôle</span>
          <strong>Administrateur</strong>
        </div>
      ) : (
        <label>
          Rôle
          <select value={role} onChange={(event) => setRole(event.target.value as User["role"])}>
            <option value="doctor">Médecin</option>
            <option value="technician">Technicien</option>
            <option value="admin">Administrateur</option>
          </select>
        </label>
      )}
      <label>
        Mot de passe
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
      </label>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <button type="submit">{isSetup ? "Créer l'administrateur" : "Créer l'utilisateur"}</button>
    </form>
  );
}

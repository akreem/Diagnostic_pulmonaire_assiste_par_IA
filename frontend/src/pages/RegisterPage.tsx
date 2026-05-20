import { FormEvent, useState } from "react";
import { z } from "zod";

import { registerUser, User } from "../services/api";

const registrationSchema = z.object({
  email: z.string().email("Enter a valid email"),
  full_name: z.string().min(2, "Full name is required"),
  password: z.string().min(10, "Use at least 10 characters"),
  role: z.enum(["doctor", "technician", "admin"])
});

type Props = {
  onRegistered: () => void;
};

export function RegisterPage({ onRegistered }: Props) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>("doctor");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      setError(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }

    try {
      await registerUser(parsed.data);
      setMessage("Account created. You can log in now.");
      onRegistered();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <form className="auth-panel" onSubmit={submit}>
      <h1>Create account</h1>
      <label>
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
      </label>
      <label>
        Full name
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
      </label>
      <label>
        Role
        <select value={role} onChange={(event) => setRole(event.target.value as User["role"])}>
          <option value="doctor">Doctor</option>
          <option value="technician">Technician</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label>
        Password
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
      </label>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <button type="submit">Register</button>
    </form>
  );
}


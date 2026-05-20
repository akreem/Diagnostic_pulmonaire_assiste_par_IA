import { useEffect, useState } from "react";

import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { clearToken, getCurrentUser, getToken, logoutUser, User } from "./services/api";

type Mode = "login" | "register";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    setMode("login");
  }

  if (loading) {
    return <div className="screen-center">Loading session...</div>;
  }

  if (user) {
    return <DashboardPage user={user} onLogout={handleLogout} />;
  }

  return (
    <main className="auth-layout">
      <section className="intro-copy">
        <p className="eyebrow">Clinical decision support</p>
        <h1>Secure access for AI-assisted chest X-ray review</h1>
        <p>
          Sprint 1 focuses on the user foundation: registration, login, JWT sessions,
          and audit logging before image workflows are added.
        </p>
      </section>

      <section>
        <div className="tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
            Login
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">
            Register
          </button>
        </div>
        {mode === "login" ? (
          <LoginPage onLogin={setUser} />
        ) : (
          <RegisterPage onRegistered={() => setMode("login")} />
        )}
      </section>
    </main>
  );
}


import { ReactNode, useEffect, useState } from "react";

import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { clearToken, getCurrentUser, getSetupStatus, getToken, logoutUser, User } from "./services/api";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const setup = await getSetupStatus();
        setHasAdmin(setup.has_admin);

        if (getToken()) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  async function handleLogout() {
    await logoutUser();
    setUser(null);
  }

  async function handleAdminInitialized() {
    setHasAdmin(true);
    await logoutUser();
    setUser(null);
  }

  if (loading) {
    return <div className="screen-center">Chargement de la session...</div>;
  }

  const authShell = (content: ReactNode, variant: "setup" | "login" = "setup") => (
    <main className={`auth-layout ${variant === "login" ? "evax-login-layout" : ""}`}>
      {variant === "login" ? (
        <section className="evax-auth-aside">
          <div className="signin-cover-image" aria-hidden="true" />
          <div className="evax-public-header">
            <span>République Tunisienne</span>
            <strong>Ministère de la Santé</strong>
          </div>
          <div className="evax-brand-copy">
            <span className="evax-mark">IA</span>
            <h1>Plateforme d'Aide au Diagnostic Pulmonaire par IA</h1>
            <p>Espace sécurisé pour les professionnels de santé autorisés.</p>
          </div>
        </section>
      ) : (
        <section className="intro-copy">
          <p className="eyebrow">Aide à la décision clinique</p>
          <h1>Espace de diagnostic pulmonaire</h1>
          <p>
            Accès sécurisé pour l'import des images radiologiques, l'analyse assistée par IA,
            la traçabilité et la gestion contrôlée des utilisateurs.
          </p>
        </section>
      )}

      <section>{content}</section>
    </main>
  );

  if (!hasAdmin) {
    return authShell(
      <div className="setup-stack">
        {user && (
          <div className="session-notice">
            <span>Connecté en tant que {user.full_name}</span>
            <button className="secondary" onClick={handleLogout} type="button">
              Déconnexion
            </button>
          </div>
        )}
        <RegisterPage mode="setup" onRegistered={handleAdminInitialized} />
      </div>
    );
  }

  if (user) {
    return <DashboardPage user={user} onLogout={handleLogout} />;
  }

  return authShell(<LoginPage onLogin={setUser} />, "login");
}

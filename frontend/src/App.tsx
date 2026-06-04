import { ReactNode, useEffect, useState } from "react";

import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { clearToken, getCurrentUser, getSetupStatus, getToken, logoutUser, User } from "./services/api";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"fr" | "ar">(() => {
    const saved = localStorage.getItem("pfd_lang");
    return (saved === "fr" || saved === "ar") ? saved : "fr";
  });

  const handleLanguageChange = (lang: "fr" | "ar") => {
    setLanguage(lang);
    localStorage.setItem("pfd_lang", lang);
  };

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
    return <div className="screen-center">{language === "ar" ? "جاري تحميل الجلسة..." : "Chargement de la session..."}</div>;
  }

  const authShell = (content: ReactNode, variant: "setup" | "login" = "setup") => (
    <main className={`auth-layout ${variant === "login" ? "evax-login-layout" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
      {variant === "login" ? (
        <section className="evax-auth-aside">
          <div className="signin-cover-image" aria-hidden="true" />
          <div className="evax-public-header">
            <span>{language === "ar" ? "الجمهورية التونسية" : "République Tunisienne"}</span>
            <strong>{language === "ar" ? "وزارة الصحة" : "Ministère de la Santé"}</strong>
          </div>
          <div className="evax-brand-copy">
            <img className="evax-mark app-logo-image" src="/lungai.jpeg" alt="LungAI" />
            <h1>{language === "ar" ? "منصة المساعدة على التشخيص الرئوي بالذكاء الاصطناعي" : "Plateforme d'Aide au Diagnostic Pulmonaire par IA"}</h1>
            <p>{language === "ar" ?  "فضاء آمن للإطار الطبي المرخص له " : "Espace sécurisé pour les professionnels de santé autorisés."}</p>
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
    return <DashboardPage user={user} language={language} onLanguageChange={handleLanguageChange} onLogout={handleLogout} />;
  }

  return authShell(<LoginPage language={language} onLanguageChange={handleLanguageChange} onLogin={setUser} />, "login");
}

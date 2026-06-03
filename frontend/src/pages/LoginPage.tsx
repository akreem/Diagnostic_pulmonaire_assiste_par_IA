import { FormEvent, useState } from "react";

import { loginUser, saveToken, User } from "../services/api";

type Props = {
  language: "fr" | "ar";
  onLanguageChange: (lang: "fr" | "ar") => void;
  onLogin: (user: User) => void;
};

const translations = {
  fr: {
    professionalSpace: "Espace professionnel",
    connection: "Connexion",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "nom@hopital.tn",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "Mot de passe",
    submitButton: "Se connecter",
    technicalSupport: "Assistance technique",
    diagnosticIA: "Diagnostic IA",
    loginFailed: "Échec de la connexion",
    consentLabel: "Je consens explicitement au traitement de mes données de santé et des données de santé des patients ingérées à des fins de diagnostic par IA.",
    errConsent: "Le consentement au traitement des données de santé est obligatoire.",
  },
  ar: {
    professionalSpace: "الفضاء المهني",
    connection: "تسجيل الدخول",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "name@hospital.tn",
    passwordLabel: "كلمة العبور",
    passwordPlaceholder: "كلمة العبور",
    submitButton: "تسجيل الدخول",
    technicalSupport: "الدعم الفني",
    diagnosticIA: "التشخيص بالذكاء الاصطناعي",
    loginFailed: "فشل في تسجيل الدخول",
    consentLabel: "أوافق صراحة على معالجة بياناتي الصحية والبيانات الصحية للمرضى التي يتم إدخالها لأغراض التشخيص بالذكاء الاصطناعي.",
    errConsent: "الموافقة على معالجة البيانات الصحية مطلوبة.",
  }
};

export function LoginPage({ language, onLanguageChange, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentGranted, setConsentGranted] = useState(false);
  const [error, setError] = useState("");

  const t = translations[language];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!consentGranted) {
      setError(t.errConsent);
      return;
    }

    try {
      const response = await loginUser({ email, password, consent_granted: true });
      saveToken(response.access_token);
      onLogin(response.user);
    } catch (err) {
      let errMsg = err instanceof Error ? err.message : t.loginFailed;
      if (language === "ar") {
        if (errMsg === "Adresse e-mail ou mot de passe invalide") {
          errMsg = "البريد الإلكتروني أو كلمة العبور غير صالحة";
        } else if (errMsg === "La requête a échoué" || errMsg === "Request failed") {
          errMsg = "فشلت العملية";
        } else if (errMsg === "Échec de la connexion") {
          errMsg = "فشل في تسجيل الدخول";
        }
      }
      setError(errMsg);
    }
  }

  return (
    <form className="evax-login-card" onSubmit={submit} dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="evax-login-topline">
        <button
          type="button"
          onClick={() => onLanguageChange("fr")}
          className={`lang-select-btn ${language === "fr" ? "active" : ""}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <img src="/france.svg" alt="Français" style={{ width: "18px", height: "12px", objectFit: "cover", borderRadius: "2px" }} />
          <span>Français</span>
        </button>
        <span className="lang-divider">|</span>
        <button
          type="button"
          onClick={() => onLanguageChange("ar")}
          className={`lang-select-btn ${language === "ar" ? "active" : ""}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <img src="/tunisia.svg" alt="العربية" style={{ width: "18px", height: "12px", objectFit: "cover", borderRadius: "2px" }} />
          <span>العربية</span>
        </button>
      </div>

      <div className="evax-login-title">
        <span className="evax-login-logo">IA</span>
        <p>{t.professionalSpace}</p>
        <h1>{t.connection}</h1>
      </div>

      <label>
        {t.emailLabel}
        <input
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
        />
      </label>
      <label>
        {t.passwordLabel}
        <input
          autoComplete="current-password"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
        />
      </label>
      
      <label className="checkbox-label consent-checkbox-wrapper" style={{ display: "flex", gap: "8px", alignItems: "flex-start", margin: "12px 0", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={consentGranted}
          onChange={(event) => setConsentGranted(event.target.checked)}
          style={{ marginTop: "4px" }}
          required
        />
        <span style={{ fontSize: "0.85rem", lineHeight: "1.3", color: "#475569", textAlign: language === "ar" ? "right" : "left" }}>{t.consentLabel}</span>
      </label>

      {error && <p className="error">{error}</p>}
      <button className="evax-login-button" type="submit" disabled={!consentGranted}>{t.submitButton}</button>

      <div className="evax-login-footer">
        <span>{t.technicalSupport}</span>
        <strong>{t.diagnosticIA}</strong>
      </div>
    </form>
  );
}


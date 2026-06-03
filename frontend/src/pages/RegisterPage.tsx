import { FormEvent, useState } from "react";
import { z } from "zod";

import { registerUser, User } from "../services/api";

const registerTranslations = {
  fr: {
    setupTitle: "Initialiser l'administrateur",
    adminTitle: "Créer un utilisateur",
    setupNote: "Aucun compte administrateur n'existe encore. Créez le premier administrateur pour activer le système.",
    adminNote: "Ajoutez un utilisateur médical autorisé à accéder à l'espace de diagnostic.",
    emailLabel: "Adresse e-mail",
    nameLabel: "Nom complet",
    roleLabel: "Rôle",
    roleDoctor: "Médecin",
    roleTechnician: "Technicien",
    roleAdmin: "Administrateur",
    passwordLabel: "Mot de passe",
    btnSetup: "Créer l'administrateur",
    btnAdmin: "Créer l'utilisateur",
    errEmail: "Saisissez une adresse e-mail valide",
    errName: "Le nom complet est obligatoire",
    errPassword: "Utilisez au moins 10 caractères",
    errInvalid: "Formulaire invalide",
    successSetup: "Compte administrateur créé. Vous pouvez vous connecter.",
    successAdmin: "Compte créé.",
    errFail: "Échec de la création du compte",
    consentLabel: "Je consens explicitement au traitement de mes données de santé et des données de santé des patients ingérées à des fins de diagnostic par IA.",
    errConsent: "Le consentement au traitement des données de santé est obligatoire."
  },
  ar: {
    setupTitle: "تهيئة المشرف",
    adminTitle: "إنشاء مستخدم",
    setupNote: "لا يوجد حساب مشرف بعد. قم بإنشاء أول مشرف لتفعيل النظام.",
    adminNote: "أضف مستخدمًا طبيًا مصرحًا له بالوصول إلى مساحة التشخيص.",
    emailLabel: "البريد الإلكتروني",
    nameLabel: "الاسم الكامل",
    roleLabel: "الدور",
    roleDoctor: "طبيب",
    roleTechnician: "تقني",
    roleAdmin: "مشرف",
    passwordLabel: "كلمة المرور",
    btnSetup: "إنشاء المشرف",
    btnAdmin: "إنشاء المستخدم",
    errEmail: "أدخل بريدًا إلكترونيًا صالحًا",
    errName: "الاسم الكامل مطلوب",
    errPassword: "استخدم 10 أحرف على الأقل",
    errInvalid: "النموذج غير صالح",
    successSetup: "تم إنشاء حساب المشرف. يمكنك الآن تسجيل الدخول.",
    successAdmin: "تم إنشاء الحساب بنجاح.",
    errFail: "فشل إنشاء الحساب",
    consentLabel: "أوافق صراحة على معالجة بياناتي الصحية والبيانات الصحية للمرضى التي يتم إدخالها لأغراض التشخيص بالذكاء الاصطناعي.",
    errConsent: "الموافقة على معالجة البيانات الصحية مطلوبة."
  }
};

type Props = {
  onRegistered: () => void;
  mode?: "setup" | "admin";
  language?: "fr" | "ar";
};

export function RegisterPage({ onRegistered, mode = "admin", language = "fr" }: Props) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>(mode === "setup" ? "admin" : "doctor");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isSetup = mode === "setup";

  const t = registerTranslations[language];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const registrationSchema = z.object({
      email: z.string().email(t.errEmail),
      full_name: z.string().min(2, t.errName),
      password: z.string().min(10, t.errPassword),
      role: z.enum(["doctor", "technician", "admin"])
    });

    const parsed = registrationSchema.safeParse({
      email,
      full_name: fullName,
      password,
      role
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t.errInvalid);
      return;
    }

    try {
      await registerUser(parsed.data);
      setEmail("");
      setFullName("");
      setPassword("");
      setRole(isSetup ? "admin" : "doctor");
      setMessage(isSetup ? t.successSetup : t.successAdmin);
      onRegistered();
    } catch (err) {
      let errMsg = err instanceof Error ? err.message : t.errFail;
      if (language === "ar") {
        if (errMsg.includes("already registered") || errMsg.includes("déjà utilisé") || errMsg.includes("déjà enregistré")) {
          errMsg = "البريد الإلكتروني مستخدم بالفعل";
        } else if (errMsg === "La requête a échoué" || errMsg === "Request failed") {
          errMsg = "فشلت العملية";
        }
      }
      setError(errMsg);
    }
  }

  return (
    <form className="auth-panel" onSubmit={submit}>
      <h1>{isSetup ? t.setupTitle : t.adminTitle}</h1>
      <p className="form-note">
        {isSetup ? t.setupNote : t.adminNote}
      </p>
      <label>
        {t.emailLabel}
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>
      <label>
        {t.nameLabel}
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </label>
      {isSetup ? (
        <div className="readonly-field">
          <span>{t.roleLabel}</span>
          <strong>{t.roleAdmin}</strong>
        </div>
      ) : (
        <label>
          {t.roleLabel}
          <select value={role} onChange={(event) => setRole(event.target.value as User["role"])}>
            <option value="doctor">{t.roleDoctor}</option>
            <option value="technician">{t.roleTechnician}</option>
            <option value="admin">{t.roleAdmin}</option>
          </select>
        </label>
      )}
      <label>
        {t.passwordLabel}
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
      </label>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <button type="submit">{isSetup ? t.btnSetup : t.btnAdmin}</button>
    </form>
  );
}

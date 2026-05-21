import { DragEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { RegisterPage } from "./RegisterPage";
import { getGradcamImage, listUsers, MedicalImage, uploadMedicalImages, User } from "../services/api";

type Props = {
  user: User;
  onLogout: () => void;
};

type PanelId = "overview" | "patients" | "intake" | "results" | "admin";
type IconName =
  | "activity"
  | "analysis"
  | "bell"
  | "brightness"
  | "chart"
  | "chevronDown"
  | "contrast"
  | "dashboard"
  | "fileText"
  | "logout"
  | "lungs"
  | "measure"
  | "patients"
  | "plus"
  | "settings"
  | "shield"
  | "upload"
  | "zoomIn";

type Severity = "Normal" | "Suspect" | "Critique";

const dashboardRoutes: Record<PanelId, string> = {
  overview: "/dashboard",
  patients: "/patients",
  intake: "/analyses",
  results: "/resultats",
  admin: "/parametres"
};

const legacyRoutes: Record<string, PanelId> = {
  "/import-analyse": "intake",
  "/historique": "patients",
  "/gestion-utilisateurs": "admin",
  "/utilisateurs": "admin"
};

const dashboardPages: Array<{ id: PanelId; title: string; icon: IconName; adminOnly?: boolean }> = [
  { id: "overview", title: "Dashboard", icon: "dashboard" },
  { id: "patients", title: "Patients", icon: "patients" },
  { id: "intake", title: "Analyses", icon: "analysis" },
  { id: "results", title: "Reports", icon: "fileText" },
  { id: "admin", title: "Settings", icon: "settings", adminOnly: true }
];

function routeToPanel(pathname: string): PanelId {
  const legacyPanel = legacyRoutes[pathname];
  if (legacyPanel) {
    window.history.replaceState({}, "", dashboardRoutes[legacyPanel]);
    return legacyPanel;
  }
  const match = Object.entries(dashboardRoutes).find(([, route]) => route === pathname);
  return match ? (match[0] as PanelId) : "overview";
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, JSX.Element> = {
    activity: (
      <>
        <path d="M22 12h-4l-3 8-6-16-3 8H2" />
      </>
    ),
    analysis: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9h6" />
        <path d="M7 13h10" />
        <path d="M7 17h4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    brightness: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15v-3" />
        <path d="M12 15V9" />
        <path d="M16 15V7" />
      </>
    ),
    chevronDown: <path d="m8 10 4 4 4-4" />,
    contrast: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="M12 3a9 9 0 0 1 0 18" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="8" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="15" width="7" height="6" rx="1" />
      </>
    ),
    fileText: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 6H6v12h4" />
        <path d="M14 8l4 4-4 4" />
        <path d="M8 12h10" />
      </>
    ),
    lungs: (
      <>
        <path d="M12 4v7" />
        <path d="M12 11c-2.4-3.6-5.6-4.7-7-2.3-1.3 2.2-1 8.5 1.2 10.1 2.1 1.5 4.4-.2 5.8-3.8" />
        <path d="M12 11c2.4-3.6 5.6-4.7 7-2.3 1.3 2.2 1 8.5-1.2 10.1-2.1 1.5-4.4-.2-5.8-3.8" />
        <path d="M9 4c1.2.7 2 1.6 3 3" />
        <path d="M15 4c-1.2.7-2 1.6-3 3" />
      </>
    ),
    measure: (
      <>
        <path d="M4 19 19 4" />
        <path d="m7 16 1 1" />
        <path d="m10 13 1 1" />
        <path d="m13 10 1 1" />
        <path d="m16 7 1 1" />
      </>
    ),
    patients: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    settings: (
      <>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1v.17a2 2 0 0 1-4 0V21a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H2.83a2 2 0 0 1 0-4H3a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1V2.83a2 2 0 0 1 4 0V3a1.65 1.65 0 0 0 .4 1 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.35.68.6 1 .32.25.68.4 1.08.4h.09a2 2 0 0 1 0 4h-.09c-.4 0-.76.15-1.08.4-.25.32-.46.64-.6 1Z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 15V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </>
    ),
    zoomIn: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
        <path d="M11 8v6" />
        <path d="M8 11h6" />
      </>
    )
  };

  return (
    <svg aria-hidden="true" className="clinical-icon" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function GradcamViewer({ imageId }: { imageId: number }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getGradcamImage(imageId).then(setUrl).catch(() => null);
  }, [imageId]);

  if (!url) {
    return <div className="scan-skeleton" aria-label="Chargement de la carte Grad-CAM" />;
  }

  return <img src={url} alt="Carte d'explicabilite Grad-CAM" className="gradcam-image" />;
}

function roleLabel(role: User["role"]) {
  const labels: Record<User["role"], string> = {
    doctor: "Medecin",
    technician: "Technicien",
    admin: "Administrateur"
  };
  return labels[role];
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date indisponible";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getSeverity(image: MedicalImage): Severity {
  if (image.ai_analysis_status === "failed") return "Suspect";
  if (image.ai_prediction === "PNEUMONIA" && (image.ai_confidence ?? 0) >= 0.76) return "Critique";
  if (image.ai_prediction === "PNEUMONIA" || image.is_ambiguous) return "Suspect";
  return "Normal";
}

function predictionLabel(image: MedicalImage) {
  if (image.ai_analysis_status === "failed") return "Modele IA indisponible";
  if (image.status !== "analyzed") return "Analyse en attente";
  return image.ai_prediction === "PNEUMONIA" ? "Pneumonie detectee" : "Aucun signe de pneumonie";
}

function statusLabel(image: MedicalImage) {
  if (image.ai_analysis_status === "failed") return "IA indisponible";
  const labels: Record<MedicalImage["status"], string> = {
    uploaded: "Importe",
    validation_failed: "Validation echouee",
    validated: "Valide",
    anonymized: "Anonymise",
    analyzed: "Analyse"
  };
  return labels[image.status];
}

function confidencePercent(image: MedicalImage) {
  if (image.ai_analysis_status === "failed") return 0;
  return Math.round((image.ai_confidence ?? 0) * 100);
}

function ClinicalAlert({
  type,
  children
}: {
  type: "info" | "success" | "warning" | "critical";
  children: ReactNode;
}) {
  return (
    <div className={`clinical-alert ${type}`} role={type === "critical" ? "alert" : "status"}>
      <Icon name={type === "critical" ? "activity" : "shield"} />
      <span>{children}</span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`severity-badge ${severity.toLowerCase()}`}>{severity}</span>;
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="confidence-meter" aria-label={`Score de confiance ${value}%`}>
      <div className="confidence-meter-header">
        <span>Confiance IA</span>
        <strong>{value}%</strong>
      </div>
      <div className="confidence-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ScanViewer({ image }: { image: MedicalImage }) {
  return (
    <section className="scan-viewer-panel" aria-label="Visionneuse medicale">
      <div className="scan-toolbar" aria-label="Outils d'imagerie">
        {(["zoomIn", "contrast", "brightness", "measure"] as IconName[]).map((tool) => (
          <button className="tool-button" key={tool} type="button">
            <Icon name={tool} />
          </button>
        ))}
      </div>
      <div className="scan-canvas">
        {image.status === "analyzed" ? <GradcamViewer imageId={image.id} /> : <div className="scan-skeleton" />}
        {image.ai_prediction === "PNEUMONIA" && (
          <div className="scan-annotation">
            <span>Opacite suspecte</span>
          </div>
        )}
      </div>
    </section>
  );
}

function DiagnosticResultCard({ image, user }: { image: MedicalImage; user: User }) {
  const severity = getSeverity(image);
  const confidence = confidencePercent(image);

  return (
    <article className="diagnostic-result-card">
      <header className="diagnostic-header">
        <div>
          <p className="section-kicker">Diagnostic result</p>
          <h3>{image.original_filename}</h3>
        </div>
        <SeverityBadge severity={severity} />
      </header>

      <div className="patient-info-row">
        <span>
          Patient
          <strong>Patient anonymise</strong>
        </span>
        <span>
          Age
          <strong>N/R</strong>
        </span>
        <span>
          ID
          <strong>PFD-{String(image.id).padStart(5, "0")}</strong>
        </span>
        <span>
          Date
          <strong>{formatDate(image.created_at)}</strong>
        </span>
      </div>

      <div className="diagnostic-body-grid">
        <div className="diagnostic-findings">
          {image.ai_error_message && <ClinicalAlert type="warning">{image.ai_error_message}</ClinicalAlert>}
          <ConfidenceBar value={confidence} />
          <div className="finding-list">
            <div>
              <Icon name="activity" />
              <span>Conclusion IA</span>
              <strong>{predictionLabel(image)}</strong>
            </div>
            <div>
              <Icon name="shield" />
              <span>Pipeline</span>
              <strong>{statusLabel(image)}</strong>
            </div>
            <div>
              <Icon name="chart" />
              <span>Performance</span>
              <strong>{image.ai_latency_ms ? `${image.ai_latency_ms} ms` : "Latence N/R"}</strong>
            </div>
            <div>
              <Icon name="patients" />
              <span>Responsable</span>
              <strong>{roleLabel(user.role)}</strong>
            </div>
          </div>
        </div>
        <ScanViewer image={image} />
      </div>
    </article>
  );
}

function PatientTable({ images, onAnalyze }: { images: MedicalImage[]; onAnalyze: () => void }) {
  if (!images.length) {
    return (
      <div className="empty-state clinical-empty-state">
        <Icon name="patients" />
        <strong>Aucun patient dans la session</strong>
        <small>Importez une image medicale pour creer une ligne patient anonymisee.</small>
        <button onClick={onAnalyze} type="button">
          <Icon name="plus" />
          Nouvelle analyse
        </button>
      </div>
    );
  }

  return (
    <div className="clinical-table-wrap">
      <table className="clinical-table">
        <thead>
          <tr>
            <th>
              Patient ID <Icon name="chevronDown" />
            </th>
            <th>
              Examen <Icon name="chevronDown" />
            </th>
            <th>
              Date <Icon name="chevronDown" />
            </th>
            <th>
              Statut <Icon name="chevronDown" />
            </th>
            <th>
              Resultat <Icon name="chevronDown" />
            </th>
            <th>Confiance</th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => (
            <tr key={image.id}>
              <td className="mono">PFD-{String(image.id).padStart(5, "0")}</td>
              <td>{image.original_filename}</td>
              <td>{formatDate(image.created_at)}</td>
              <td>
                <span className={`status-pill ${image.ai_analysis_status === "failed" ? "warning" : image.status === "analyzed" ? "active" : "inactive"}`}>
                  {statusLabel(image)}
                </span>
              </td>
              <td>
                <SeverityBadge severity={getSeverity(image)} />
              </td>
              <td className="mono">{confidencePercent(image)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardPage({ user, onLogout }: Props) {
  const [activePanel, setActivePanel] = useState<PanelId>(() => routeToPanel(window.location.pathname));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<MedicalImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    function handleRouteChange() {
      setActivePanel(routeToPanel(window.location.pathname));
    }

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  useEffect(() => {
    if (user.role !== "admin" && activePanel === "admin") {
      navigateTo("overview", true);
    }
  }, [activePanel, user.role]);

  useEffect(() => {
    if (activePanel === "admin" && user.role === "admin") {
      loadUsers();
    }
  }, [activePanel, user.role]);

  const analyzedCount = uploadedImages.filter((image) => image.status === "analyzed").length;
  const criticalCount = uploadedImages.filter((image) => getSeverity(image) === "Critique").length;
  const normalCount = uploadedImages.filter((image) => getSeverity(image) === "Normal").length;
  const latestImage = useMemo(() => uploadedImages[0], [uploadedImages]);

  function selectFiles(fileList: FileList | null) {
    setError("");
    setWarning("");
    setSuccess("");
    setUploadProgress(0);
    setSelectedFiles(Array.from(fileList ?? []));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    selectFiles(event.dataTransfer.files);
  }

  async function handleUpload() {
    if (!selectedFiles.length) {
      setError("Selectionnez au moins une image medicale.");
      return;
    }

    setUploading(true);
    setError("");
    setWarning("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const response = await uploadMedicalImages(selectedFiles, setUploadProgress);
      setUploadedImages(response.images);
      const aiFailures = response.images.filter((image) => image.ai_analysis_status === "failed");
      if (aiFailures.length) {
        setWarning(
          `${response.images.length} fichier${response.images.length > 1 ? "s" : ""} importe${response.images.length > 1 ? "s" : ""}. ` +
            `Le modele IA est indisponible pour ${aiFailures.length} analyse${aiFailures.length > 1 ? "s" : ""}.`
        );
      } else {
        setSuccess(`${response.images.length} fichier${response.images.length > 1 ? "s" : ""} importe${response.images.length > 1 ? "s" : ""} avec succes.`);
      }
      setSelectedFiles([]);
      navigateTo("results");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Echec de l'import");
    } finally {
      setUploading(false);
    }
  }

  function navigateTo(panel: PanelId, replace = false) {
    const route = dashboardRoutes[panel];
    if (window.location.pathname !== route) {
      if (replace) {
        window.history.replaceState({}, "", route);
      } else {
        window.history.pushState({}, "", route);
      }
    }
    setActivePanel(panel);
  }

  async function loadUsers() {
    setUsersLoading(true);
    setUsersError("");
    try {
      setUsers(await listUsers());
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "Impossible de charger les utilisateurs");
    } finally {
      setUsersLoading(false);
    }
  }

  function renderOverview() {
    const metrics = [
      { label: "Examens session", value: uploadedImages.length, trend: "+12%", tone: "positive" },
      { label: "Analyses terminees", value: analyzedCount, trend: "Stable", tone: "neutral" },
      { label: "Cas critiques", value: criticalCount, trend: criticalCount ? "A reviser" : "0 alerte", tone: criticalCount ? "critical" : "positive" },
      { label: "Normaux", value: normalCount, trend: "Automatise", tone: "positive" }
    ];

    return (
      <div className="dashboard-content-grid">
        <section className="kpi-grid">
          {metrics.map((metric) => (
            <article className="kpi-card" key={metric.label}>
              <div>
                <span className="section-kicker">{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
              <em className={metric.tone}>{metric.trend}</em>
            </article>
          ))}
        </section>

        <section className="clinical-panel overview-profile-panel">
          <div>
            <p className="section-kicker">Session clinique</p>
            <h2>Diagnostic pulmonaire assiste par IA</h2>
          </div>
          <div className="profile-data-grid">
            <span>
              Utilisateur
              <strong>{user.full_name}</strong>
            </span>
            <span>
              Role
              <strong>{roleLabel(user.role)}</strong>
            </span>
            <span>
              Email
              <strong>{user.email}</strong>
            </span>
            <span>
              Acces
              <strong>{user.is_active ? "Actif" : "Inactif"}</strong>
            </span>
          </div>
          <ClinicalAlert type="info">Les resultats IA doivent etre relus par un professionnel de sante autorise.</ClinicalAlert>
        </section>

        <section className="clinical-panel">
          <div className="panel-heading-row">
            <div>
              <p className="section-kicker">Patient list</p>
              <h2>Patients recents</h2>
            </div>
            <button className="secondary" onClick={() => navigateTo("patients")} type="button">
              Voir tout
            </button>
          </div>
          <PatientTable images={uploadedImages.slice(0, 5)} onAnalyze={() => navigateTo("intake")} />
        </section>
      </div>
    );
  }

  function renderIntake() {
    return (
      <section className="clinical-panel intake-panel">
        <div>
          <p className="section-kicker">Secure intake</p>
          <h2>Importer des images medicales</h2>
        </div>

        <label className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <input
            accept=".dcm,.png,.jpg,.jpeg,application/dicom,image/png,image/jpeg"
            multiple
            onChange={(event) => selectFiles(event.target.files)}
            type="file"
          />
          <Icon name="upload" />
          <span>Depot securise</span>
          <strong>{selectedFiles.length ? `${selectedFiles.length} selectionne${selectedFiles.length > 1 ? "s" : ""}` : "Choisir des images medicales"}</strong>
          <small>DICOM, PNG ou JPEG. Les fichiers sont anonymises et chiffres au repos.</small>
        </label>

        {selectedFiles.length > 0 && (
          <ul className="file-list">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`}>
                <span>{file.name}</span>
                <small>{Math.ceil(file.size / 1024)} Ko</small>
              </li>
            ))}
          </ul>
        )}

        <div className="upload-actions">
          <button disabled={uploading} onClick={handleUpload} type="button">
            {uploading ? "Import en cours..." : "Importer et analyser"}
          </button>
          <div aria-label="Progression de l'import" className="progress-track">
            <span style={{ width: `${uploadProgress}%` }} />
          </div>
          <small className="mono">{uploadProgress}%</small>
        </div>

        {error && <ClinicalAlert type="critical">{error}</ClinicalAlert>}
        {warning && <ClinicalAlert type="warning">{warning}</ClinicalAlert>}
        {success && <ClinicalAlert type="success">{success}</ClinicalAlert>}
      </section>
    );
  }

  function renderResults() {
    if (!uploadedImages.length) {
      return (
        <div className="empty-state clinical-empty-state">
          <Icon name="fileText" />
          <strong>Aucun rapport disponible</strong>
          <small>Importez un examen pour generer une carte de resultat diagnostic.</small>
          <button onClick={() => navigateTo("intake")} type="button">
            <Icon name="plus" />
            Lancer une analyse
          </button>
        </div>
      );
    }

    return (
      <div className="results-stack">
        {warning && <ClinicalAlert type="warning">{warning}</ClinicalAlert>}
        {uploadedImages.map((image) => (
          <DiagnosticResultCard image={image} key={image.id} user={user} />
        ))}
      </div>
    );
  }

  function renderAdmin() {
    return (
      <div className="admin-grid">
        <section className="clinical-panel users-management">
          <div className="panel-heading-row">
            <div>
              <p className="section-kicker">Access control</p>
              <h2>Utilisateurs</h2>
            </div>
            <button className="secondary" onClick={loadUsers} type="button">
              Actualiser
            </button>
          </div>

          {usersError && <ClinicalAlert type="critical">{usersError}</ClinicalAlert>}

          <div className="clinical-table-wrap">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>Adresse e-mail</th>
                  <th>Role</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={4}>
                        <div className="table-skeleton" />
                      </td>
                    </tr>
                  ))
                ) : users.length > 0 ? (
                  users.map((managedUser) => (
                    <tr key={managedUser.id}>
                      <td>{managedUser.full_name}</td>
                      <td>{managedUser.email}</td>
                      <td>{roleLabel(managedUser.role)}</td>
                      <td>
                        <span className={managedUser.is_active ? "status-pill active" : "status-pill inactive"}>
                          {managedUser.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>Aucun utilisateur disponible.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="clinical-panel create-user-panel">
          <div>
            <p className="section-kicker">New account</p>
            <h2>Ajouter un utilisateur</h2>
          </div>
          <RegisterPage mode="admin" onRegistered={loadUsers} />
        </section>
      </div>
    );
  }

  function renderPage(panel: PanelId) {
    if (panel === "overview") return renderOverview();
    if (panel === "patients") {
      return (
        <section className="clinical-panel">
          <div>
            <p className="section-kicker">Patient list</p>
            <h2>Patients et examens</h2>
          </div>
          <PatientTable images={uploadedImages} onAnalyze={() => navigateTo("intake")} />
        </section>
      );
    }
    if (panel === "intake") return renderIntake();
    if (panel === "results") return renderResults();
    return renderAdmin();
  }

  const visiblePages = dashboardPages.filter((page) => !page.adminOnly || user.role === "admin");
  const activePage = visiblePages.find((page) => page.id === activePanel) ?? visiblePages[0];
  const userInitial = user.full_name.trim().charAt(0).toUpperCase() || "U";
  const patientBadge = latestImage ? `PFD-${String(latestImage.id).padStart(5, "0")}` : "Aucun patient";

  return (
    <main className="clinical-shell">
      <aside className="clinical-sidebar">
        <div className="clinical-brand">
          <span>
            <Icon name="lungs" />
          </span>
          <div>
            <strong>PulmoDiag AI</strong>
            <small>Diagnostic Workstation</small>
          </div>
        </div>

        <nav className="clinical-side-menu" aria-label="Navigation du tableau de bord">
          <span className="sidebar-section-label">Workspace</span>
          {visiblePages.map((page) => (
            <button className={activePanel === page.id ? "active" : ""} key={page.id} onClick={() => navigateTo(page.id)} type="button">
              <Icon name={page.icon} />
              <span>{page.title}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-user-card" aria-label="Utilisateur connecte">
          <span>{userInitial}</span>
          <div>
            <strong>{user.full_name}</strong>
            <small>{roleLabel(user.role)}</small>
          </div>
        </div>
      </aside>

      <section className="clinical-workspace">
        <header className="clinical-topbar">
          <div className="clinical-topbar-brand">
            <span>
              <Icon name="lungs" />
            </span>
            <strong>PulmoDiag AI</strong>
          </div>

          <div className="clinical-breadcrumb">
            <span>Diagnostic pulmonaire assiste par IA</span>
            <h1>{activePage.title}</h1>
          </div>

          <div className="clinical-top-actions">
            <span className="patient-id-badge">{patientBadge}</span>
            <button className="icon-button" aria-label="Notifications" type="button">
              <Icon name="bell" />
            </button>
            <span className="doctor-avatar" aria-label={`Docteur ${user.full_name}`}>
              {userInitial}
            </span>
            <button className="icon-button destructive" aria-label="Deconnexion" onClick={onLogout} type="button">
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <section className="clinical-main-panel">{renderPage(activePage.id)}</section>
      </section>
    </main>
  );
}

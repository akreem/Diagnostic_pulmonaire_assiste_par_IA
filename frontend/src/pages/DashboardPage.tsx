import { DragEvent, useEffect, useState } from "react";

import { RegisterPage } from "./RegisterPage";
import { getGradcamImage, MedicalImage, uploadMedicalImages, User } from "../services/api";

type Props = {
  user: User;
  onLogout: () => void;
};

type PanelId = "overview" | "intake" | "results" | "history" | "admin";
type IconName = "profile" | "grid" | "upload" | "results" | "admin" | "logout" | "user" | "chevron" | "seal";

const dashboardRoutes: Record<PanelId, string> = {
  overview: "/dashboard",
  intake: "/import-analyse",
  results: "/resultats",
  history: "/historique",
  admin: "/utilisateurs"
};

const dashboardPages: Array<{ id: PanelId; title: string; icon: IconName; adminOnly?: boolean }> = [
  { id: "overview", title: "Tableau de bord", icon: "grid" },
  { id: "intake", title: "Import et analyse des images médicales", icon: "upload" },
  { id: "results", title: "Résultats", icon: "results" },
  { id: "history", title: "Historique", icon: "results", adminOnly: true },
  { id: "admin", title: "Gestion des utilisateurs", icon: "admin", adminOnly: true }
];

function routeToPanel(pathname: string): PanelId {
  const match = Object.entries(dashboardRoutes).find(([, route]) => route === pathname);
  return match ? (match[0] as PanelId) : "overview";
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, JSX.Element> = {
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    upload: (
      <>
        <path d="M12 15V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </>
    ),
    results: (
      <>
        <path d="M5 4h14v16H5z" />
        <path d="M8 9h8" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </>
    ),
    admin: (
      <>
        <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 6H6v12h4" />
        <path d="M14 8l4 4-4 4" />
        <path d="M8 12h10" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21a6 6 0 0 1 12 0" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    seal: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v12" />
        <path d="M8 10c0 4 2 6 4 8 2-2 4-4 4-8" />
        <path d="M9 7a3 3 0 0 0 6 0" />
      </>
    )
  };

  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function GradcamViewer({ imageId }: { imageId: number }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getGradcamImage(imageId).then(setUrl).catch(() => null);
  }, [imageId]);

  if (!url) return null;
  return <img src={url} alt="Carte d'explicabilité Grad-CAM" className="gradcam-image" />;
}

function formatStatus(image: MedicalImage) {
  if (image.status === "analyzed" && image.ai_prediction) {
    const prediction = image.ai_prediction === "PNEUMONIA" ? "Pneumonie" : "Normal";
    return `${prediction} (${Math.round((image.ai_confidence ?? 0) * 100)}%)`;
  }
  const labels: Record<MedicalImage["status"], string> = {
    uploaded: "Importé",
    validation_failed: "Validation échouée",
    validated: "Validé",
    anonymized: "Anonymisé",
    analyzed: "Analysé"
  };
  return labels[image.status];
}

function roleLabel(role: User["role"]) {
  const labels: Record<User["role"], string> = {
    doctor: "Médecin",
    technician: "Technicien",
    admin: "Administrateur"
  };
  return labels[role];
}

export function DashboardPage({ user, onLogout }: Props) {
  const [activePanel, setActivePanel] = useState<PanelId>(() => routeToPanel(window.location.pathname));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<MedicalImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    function handleRouteChange() {
      setActivePanel(routeToPanel(window.location.pathname));
    }

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  useEffect(() => {
    if (user.role !== "admin" && (activePanel === "history" || activePanel === "admin")) {
      navigateTo("overview", true);
    }
  }, [activePanel, user.role]);

  function selectFiles(fileList: FileList | null) {
    setError("");
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
      setError("Sélectionnez au moins une image médicale.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const response = await uploadMedicalImages(selectedFiles, setUploadProgress);
      setUploadedImages(response.images);
      setSuccess(`${response.images.length} fichier${response.images.length > 1 ? "s" : ""} importé${response.images.length > 1 ? "s" : ""} avec succès.`);
      setSelectedFiles([]);
      navigateTo("results");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Échec de l'import");
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

  function renderPage(panel: PanelId) {
    if (panel === "overview") {
      return (
        <div className="evax-dashboard-page evax-overview-grid">
          <article>
            <span>Rôle</span>
            <strong>{roleLabel(user.role)}</strong>
          </article>
          <article>
            <span>Examens de cette session</span>
            <strong>{uploadedImages.length}</strong>
          </article>
          <article>
            <span>Acces</span>
            <strong>{user.is_active ? "Actif" : "Inactif"}</strong>
          </article>
        </div>
      );
    }

    if (panel === "intake") {
      return (
        <div className="evax-dashboard-page">
          <div className="evax-panel-actions">
            <label className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              <input
                accept=".dcm,.png,.jpg,.jpeg,application/dicom,image/png,image/jpeg"
                multiple
                onChange={(event) => selectFiles(event.target.files)}
                type="file"
              />
              <span>Import sécurisé</span>
              <strong>{selectedFiles.length ? `${selectedFiles.length} sélectionné${selectedFiles.length > 1 ? "s" : ""}` : "Choisir des images médicales"}</strong>
              <small>Les examens DICOM sont anonymisés et stockés de manière chiffrée.</small>
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
                {uploading ? "Import en cours..." : "Importer"}
              </button>
              <div aria-label="Progression de l'import" className="progress-track">
                <span style={{ width: `${uploadProgress}%` }} />
              </div>
              <small>{uploadProgress}%</small>
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </div>
        </div>
      );
    }

    if (panel === "results" || panel === "history") {
      return (
        <div className="evax-dashboard-page">
          {uploadedImages.length === 0 ? (
            <div className="empty-state">
              <strong>{panel === "history" ? "Aucun historique disponible" : "Aucun examen importé pendant cette session"}</strong>
              <small>
                {panel === "history"
                  ? "Les analyses consultées par l'administration apparaîtront ici."
                  : "Utilisez la page d'import et d'analyse pour ajouter un lot d'images."}
              </small>
            </div>
          ) : (
            <div className="upload-results">
              {uploadedImages.map((image) => (
                <article key={image.id}>
                  <div>
                    <span>{image.original_filename}</span>
                    <strong className={image.ai_prediction === "PNEUMONIA" ? "risk-high" : "risk-normal"}>
                      {formatStatus(image)}
                      {image.is_ambiguous && <small className="ambiguous-label">Ambigu</small>}
                    </strong>
                    <small>
                      {Math.ceil(image.file_size_bytes / 1024)} Ko chiffrés au repos
                      {image.ai_latency_ms && <span>{image.ai_latency_ms} ms de latence</span>}
                    </small>
                  </div>
                  {image.status === "analyzed" && <GradcamViewer imageId={image.id} />}
                </article>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="evax-dashboard-page evax-admin-body">
        <RegisterPage mode="admin" onRegistered={() => undefined} />
      </div>
    );
  }

  const visiblePages = dashboardPages.filter((page) => !page.adminOnly || user.role === "admin");
  const activePage = visiblePages.find((page) => page.id === activePanel) ?? visiblePages[0];

  return (
    <main className="evax-dashboard">
      <aside className="evax-dashboard-sidebar">
        <div className="ministry-brand">
          <img src="/favicon-CIMS_logo.png" alt="Centre Informatique du Ministère de la Santé" />
          <div>
            <strong>Centre Informatique du Ministère de la Santé</strong>
            <small>CIMS</small>
          </div>
        </div>

        <nav className="evax-side-menu" aria-label="Navigation du tableau de bord">
          {visiblePages.map((page) => (
            <button className={activePanel === page.id ? "active" : ""} key={page.id} onClick={() => navigateTo(page.id)} type="button">
              <Icon name={page.icon} />
              {page.title}
            </button>
          ))}
        </nav>

        <small className="evax-sidebar-copy">Edition initiale</small>
      </aside>

      <section className="evax-dashboard-main">
        <header className="evax-top-card">
          <h1>Bienvenue dans votre espace {user.full_name}</h1>
          <div className="evax-top-actions">
            <strong>FR</strong>
            <button aria-label="Déconnexion" className="logout-icon-button" onClick={onLogout} type="button">
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <section className="evax-main-card">
          <div className="modern-page-title">
            <div>
              <span>Diagnostic pulmonaire assisté par IA</span>
              <h2>{activePage.title}</h2>
            </div>
            <Icon name={activePage.icon} />
          </div>

          {activePanel === "overview" && (
            <>
              <div className="evax-person-row">
                <div className="evax-avatar" />
                <div className="evax-person-primary">
                  <strong>{user.full_name}</strong>
                  <span>Rôle : <b>{roleLabel(user.role)}</b></span>
                </div>
                <div className="evax-person-meta">
                  <span>Adresse e-mail <b>{user.email}</b></span>
                  <span>Statut du compte : <b>{user.is_active ? "Actif" : "Inactif"}</b></span>
                </div>
              </div>

            </>
          )}

          <div className="evax-page-content">{renderPage(activePage.id)}</div>
        </section>
      </section>
    </main>
  );
}

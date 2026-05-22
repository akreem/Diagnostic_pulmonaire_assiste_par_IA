import { DragEvent, memo, PointerEvent, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartInstance, ChartType } from "chart.js";

import { RegisterPage } from "./RegisterPage";
import {
  DashboardStats,
  exportHistoryCsv,
  getAnalysisResult,
  getDashboardStats,
  getGradcamImage,
  getMedicalImage,
  listUsers,
  MedicalImage,
  uploadMedicalImages,
  User
} from "../services/api";

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
  | "drag"
  | "fileText"
  | "logout"
  | "lungs"
  | "measure"
  | "patients"
  | "plus"
  | "settings"
  | "shield"
  | "upload"
  | "zoomIn"
  | "zoomOut";

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
    drag: (
      <>
        <path d="M5 9V6a2 2 0 0 1 4 0v3" />
        <path d="M9 9V5a2 2 0 0 1 4 0v4" />
        <path d="M13 10V6a2 2 0 0 1 4 0v7" />
        <path d="M17 11a2 2 0 0 1 4 0v2c0 5-3 8-8 8h-1a7 7 0 0 1-5.6-2.8L3 14a2 2 0 0 1 3.2-2.4L8 14" />
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
    ),
    zoomOut: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
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

function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isNearViewport) return;

    if (!("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "360px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isNearViewport]);

  return { ref, isNearViewport };
}

const CanvasOverlayViewer = memo(function CanvasOverlayViewer({
  imageId,
  canvasRef,
  onReady
}: {
  imageId: number;
  canvasRef: RefObject<HTMLCanvasElement>;
  onReady: (ready: boolean) => void;
}) {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const objectUrls: string[] = [];
    setBaseUrl(null);
    setHeatmapUrl(null);
    onReady(false);

    Promise.allSettled([getMedicalImage(imageId), getGradcamImage(imageId)]).then(([baseResult, heatmapResult]) => {
      if (!mounted) return;

      if (baseResult.status === "fulfilled") {
        objectUrls.push(baseResult.value);
        setBaseUrl(baseResult.value);
      }

      if (heatmapResult.status === "fulfilled") {
        objectUrls.push(heatmapResult.value);
        setHeatmapUrl(heatmapResult.value);
      }
    });

    return () => {
      mounted = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageId, onReady]);

  useEffect(() => {
    if ((!baseUrl && !heatmapUrl) || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    const canvasContext = context;

    let cancelled = false;

    function loadDrawableImage(url: string | null): Promise<HTMLImageElement | null> {
      if (!url) return Promise.resolve(null);

      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = url;
      });
    }

    async function drawOverlay() {
      const [baseImage, heatmapImage] = await Promise.all([loadDrawableImage(baseUrl), loadDrawableImage(heatmapUrl)]);
      if (cancelled) return;

      const drawableImage = baseImage ?? heatmapImage;
      if (!drawableImage) {
        onReady(false);
        return;
      }

      const width = drawableImage.naturalWidth;
      const height = drawableImage.naturalHeight;
      if (!width || !height) return;

      canvas.width = width;
      canvas.height = height;
      canvasContext.clearRect(0, 0, width, height);

      if (baseImage) {
        canvasContext.drawImage(baseImage, 0, 0, width, height);
      }

      if (heatmapImage) {
        canvasContext.globalAlpha = baseImage ? 0.58 : 1;
        canvasContext.globalCompositeOperation = "source-over";
        canvasContext.drawImage(heatmapImage, 0, 0, width, height);
      }

      canvasContext.globalAlpha = 1;
      onReady(true);
    }

    drawOverlay();

    return () => {
      cancelled = true;
    };
  }, [baseUrl, canvasRef, heatmapUrl, onReady]);

  if (!baseUrl && !heatmapUrl) {
    return <div className="scan-skeleton" aria-label="Chargement de la carte Grad-CAM" />;
  }

  return <canvas ref={canvasRef} aria-label="Superposition image et heatmap Grad-CAM" className="scan-overlay-canvas" />;
});

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

function DashboardChart({
  title,
  type,
  labels,
  values,
  colors
}: {
  title: string;
  type: ChartType;
  labels: string[];
  values: number[];
  colors: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartInstance | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type,
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: colors,
            borderRadius: type === "bar" ? 6 : undefined,
            borderWidth: type === "doughnut" ? 0 : 1
          }
        ]
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type !== "bar",
            position: "bottom",
            labels: {
              boxWidth: 10,
              color: "#475569",
              font: { size: 11, weight: 700 }
            }
          },
          title: { display: false }
        },
        scales:
          type === "bar"
            ? {
                x: {
                  grid: { display: false },
                  ticks: { color: "#64748b", font: { size: 11, weight: 700 } }
                },
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0, color: "#64748b" }
                }
              }
            : undefined
      }
    });

    return () => chartRef.current?.destroy();
  }, [colors, labels, type, values]);

  return (
    <section className="clinical-panel chart-panel">
      <div>
        <p className="section-kicker">Chart.js</p>
        <h2>{title}</h2>
      </div>
      <div className="chart-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
    </section>
  );
}

const ScanViewer = memo(function ScanViewer({ image }: { image: MedicalImage }) {
  const annotatedCanvasRef = useRef<HTMLCanvasElement>(null);
  const { ref: viewportRef, isNearViewport } = useNearViewport<HTMLDivElement>();
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [measureEnabled, setMeasureEnabled] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [canExport, setCanExport] = useState(false);
  const zoomPercent = Math.round(zoom * 100);
  const brightnessPercent = Math.round(brightness * 100);
  const contrastPercent = Math.round(contrast * 100);

  function changeZoom(delta: number) {
    setZoom((current) => Math.min(2.5, Math.max(0.75, Number((current + delta).toFixed(2)))));
  }

  function cycleBrightness() {
    setBrightness((current) => (current >= 1.3 ? 0.85 : Number((current + 0.15).toFixed(2))));
  }

  function cycleContrast() {
    setContrast((current) => (current >= 1.4 ? 0.85 : Number((current + 0.15).toFixed(2))));
  }

  function resetViewer() {
    setZoom(1);
    setBrightness(1);
    setContrast(1);
    setPan({ x: 0, y: 0 });
  }

  function exportAnnotatedImage() {
    const canvas = annotatedCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    const safeName = image.original_filename.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
    link.download = `${safeName || "analysis"}-annotated.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!dragEnabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({ x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart) return;
    setPan({
      x: dragStart.panX + event.clientX - dragStart.x,
      y: dragStart.panY + event.clientY - dragStart.y
    });
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (dragStart) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragStart(null);
  }

  return (
    <section className="scan-viewer-panel" aria-label="Visionneuse medicale">
      <div className="scan-toolbar" aria-label="Outils d'imagerie">
        <button
          aria-pressed={dragEnabled}
          aria-label="Déplacer l'image"
          className={`tool-button ${dragEnabled ? "active" : ""}`}
          onClick={() => setDragEnabled((enabled) => !enabled)}
          title="Déplacer l'image"
          type="button"
        >
          <Icon name="drag" />
        </button>
        <button
          aria-label="Réduire le zoom"
          className="tool-button"
          disabled={zoom <= 0.75}
          onClick={() => changeZoom(-0.25)}
          title="Réduire le zoom"
          type="button"
        >
          <Icon name="zoomOut" />
        </button>
        <button
          aria-label="Agrandir le zoom"
          className="tool-button"
          disabled={zoom >= 2.5}
          onClick={() => changeZoom(0.25)}
          title="Agrandir le zoom"
          type="button"
        >
          <Icon name="zoomIn" />
        </button>
        <button
          aria-label="Réinitialiser le zoom"
          className="tool-button zoom-reset-button"
          onClick={() => setZoom(1)}
          title="Réinitialiser le zoom"
          type="button"
        >
          {zoomPercent}%
        </button>
        <button
          aria-label={`Contraste ${contrastPercent}%`}
          className={`tool-button ${contrast !== 1 ? "active" : ""}`}
          onClick={cycleContrast}
          title={`Contraste ${contrastPercent}%`}
          type="button"
        >
          <Icon name="contrast" />
        </button>
        <button
          aria-label={`Luminosité ${brightnessPercent}%`}
          className={`tool-button ${brightness !== 1 ? "active" : ""}`}
          onClick={cycleBrightness}
          title={`Luminosité ${brightnessPercent}%`}
          type="button"
        >
          <Icon name="brightness" />
        </button>
        <button
          aria-pressed={measureEnabled}
          aria-label="Afficher la mesure"
          className={`tool-button ${measureEnabled ? "active" : ""}`}
          onClick={() => setMeasureEnabled((enabled) => !enabled)}
          title="Afficher la mesure"
          type="button"
        >
          <Icon name="measure" />
        </button>
        <button className="tool-button zoom-reset-button" onClick={resetViewer} title="Réinitialiser la vue" type="button">
          Reset
        </button>
        <button
          className="tool-button export-image-button"
          disabled={!canExport}
          onClick={exportAnnotatedImage}
          title="Exporter l'image annotée"
          type="button"
        >
          PNG
        </button>
      </div>
      <div
        ref={viewportRef}
        className={`scan-canvas ${dragEnabled ? "draggable" : ""} ${dragStart ? "dragging" : ""}`}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
      >
        <div
          className="scan-image-frame"
          style={{
            filter: `brightness(${brightness}) contrast(${contrast})`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {image.status === "analyzed" && isNearViewport ? (
            <CanvasOverlayViewer canvasRef={annotatedCanvasRef} imageId={image.id} onReady={setCanExport} />
          ) : image.status === "analyzed" ? (
            <div className="scan-skeleton" aria-label="Image en attente de chargement optimisé" />
          ) : (
            <div className="scan-skeleton" />
          )}
          {image.ai_prediction === "PNEUMONIA" && (
            <div className="scan-annotation">
              <span>Opacite suspecte</span>
            </div>
          )}
          {measureEnabled && (
            <div className="scan-measurement" aria-hidden="true">
              <span>42 mm</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

const DiagnosticResultCard = memo(function DiagnosticResultCard({ image, user }: { image: MedicalImage; user: User }) {
  const [result, setResult] = useState(image);
  const severity = getSeverity(result);
  const confidence = confidencePercent(result);

  useEffect(() => {
    let mounted = true;
    getAnalysisResult(image.id)
      .then((latest) => {
        if (mounted) setResult(latest);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [image.id]);

  return (
    <article className="diagnostic-result-card">
      <header className="diagnostic-header">
        <div>
          <p className="section-kicker">Diagnostic result</p>
          <h3>{result.original_filename}</h3>
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
          <strong>PFD-{String(result.id).padStart(5, "0")}</strong>
        </span>
        <span>
          Date
          <strong>{formatDate(result.created_at)}</strong>
        </span>
      </div>

      <div className="diagnostic-body-grid">
        <div className="diagnostic-findings">
          {result.ai_error_message && <ClinicalAlert type="warning">{result.ai_error_message}</ClinicalAlert>}
          <ConfidenceBar value={confidence} />
          <div className="finding-list">
            <div>
              <Icon name="activity" />
              <span>Conclusion IA</span>
              <strong>{predictionLabel(result)}</strong>
            </div>
            <div>
              <Icon name="shield" />
              <span>Pipeline</span>
              <strong>{statusLabel(result)}</strong>
            </div>
            <div>
              <Icon name="chart" />
              <span>Performance</span>
              <strong>{result.ai_latency_ms ? `${result.ai_latency_ms} ms` : "Latence N/R"}</strong>
            </div>
            <div>
              <Icon name="patients" />
              <span>Responsable</span>
              <strong>{roleLabel(user.role)}</strong>
            </div>
          </div>
        </div>
        <ScanViewer image={result} />
      </div>
    </article>
  );
});

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
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [historyExporting, setHistoryExporting] = useState(false);

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

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const displayedImages = uploadedImages.length ? uploadedImages : dashboardStats?.recent_analyses ?? [];
  const analyzedCount = dashboardStats?.analyzed_count ?? displayedImages.filter((image) => image.status === "analyzed").length;
  const criticalCount = dashboardStats?.critical_count ?? displayedImages.filter((image) => getSeverity(image) === "Critique").length;
  const normalCount = dashboardStats?.normal_count ?? displayedImages.filter((image) => getSeverity(image) === "Normal").length;
  const totalExams = dashboardStats?.total_exams ?? displayedImages.length;
  const recentAnalyses = dashboardStats?.recent_analyses ?? displayedImages.slice(0, 5);
  const latestImage = useMemo(() => displayedImages[0], [displayedImages]);

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
      await loadDashboardStats();
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

  async function loadDashboardStats() {
    setStatsLoading(true);
    try {
      setDashboardStats(await getDashboardStats());
    } catch {
      setDashboardStats(null);
    } finally {
      setStatsLoading(false);
    }
  }

  async function handleHistoryExport() {
    setHistoryExporting(true);
    setError("");
    try {
      await exportHistoryCsv();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'exporter l'historique CSV");
    } finally {
      setHistoryExporting(false);
    }
  }

  function renderOverview() {
    const metrics = [
      { label: "Examens total", value: totalExams, trend: statsLoading ? "Chargement" : "API", tone: "positive" },
      { label: "Analyses terminees", value: analyzedCount, trend: "Stable", tone: "neutral" },
      { label: "Cas critiques", value: criticalCount, trend: criticalCount ? "A reviser" : "0 alerte", tone: criticalCount ? "critical" : "positive" },
      { label: "Normaux", value: normalCount, trend: "Automatise", tone: "positive" }
    ];
    const severityLabels = dashboardStats?.severity_breakdown.map((item) => item.label) ?? ["Normal", "Suspect", "Critical", "Pending"];
    const severityValues = dashboardStats?.severity_breakdown.map((item) => item.value) ?? [
      normalCount,
      displayedImages.filter((image) => getSeverity(image) === "Suspect").length,
      criticalCount,
      displayedImages.filter((image) => image.status !== "analyzed").length
    ];
    const statusLabels = dashboardStats?.status_breakdown.map((item) => item.label) ?? ["uploaded", "validated", "anonymized", "analyzed"];
    const statusValues = dashboardStats?.status_breakdown.map((item) => item.value) ?? [
      displayedImages.filter((image) => image.status === "uploaded").length,
      displayedImages.filter((image) => image.status === "validated").length,
      displayedImages.filter((image) => image.status === "anonymized").length,
      displayedImages.filter((image) => image.status === "analyzed").length
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

        <div className="dashboard-chart-grid">
          <DashboardChart
            colors={["#10b981", "#f59e0b", "#ef4444", "#64748b"]}
            labels={severityLabels}
            title="Répartition des diagnostics"
            type="doughnut"
            values={severityValues}
          />
          <DashboardChart
            colors={["#94a3b8", "#38bdf8", "#14b8a6", "#2563eb", "#f97316"]}
            labels={statusLabels}
            title="Statuts du pipeline"
            type="bar"
            values={statusValues}
          />
        </div>

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
          <PatientTable images={recentAnalyses} onAnalyze={() => navigateTo("intake")} />
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
          <div className="panel-actions-row">
            <button className="secondary" disabled={historyExporting} onClick={handleHistoryExport} type="button">
              {historyExporting ? "Export..." : "Exporter CSV"}
            </button>
          </div>
          {error && <ClinicalAlert type="critical">{error}</ClinicalAlert>}
          <PatientTable images={displayedImages} onAnalyze={() => navigateTo("intake")} />
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

import { DragEvent, memo, PointerEvent, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartInstance, ChartType } from "chart.js";

import { RegisterPage } from "./RegisterPage";
import {
  AnalysisHistory,
  AppNotification,
  DashboardStats,
  downloadReportPdf,
  exportHistoryCsv,
  getAnalysisResult,
  getDashboardStats,
  getGradcamImage,
  getMedicalImage,
  getNotificationPreference,
  HistoryFilters,
  HistoryPage,
  listAnalysisHistory,
  listNotifications,
  listUsers,
  markNotificationRead,
  markNotificationUnread,
  MedicalImage,
  NotificationPreference,
  updateNotificationPreference,
  uploadMedicalImages,
  User,
  grantConsent
} from "../services/api";

type Props = {
  user: User;
  language: "fr" | "ar";
  onLanguageChange: (lang: "fr" | "ar") => void;
  onLogout: () => void;
};

const dashboardTranslations = {
  fr: {
    overview: "Dashboard",
    intake: "Analyses",
    results: "Reports",
    patients: "Historique des analyses",
    admin: "Settings",
    workspace: "Workspace",
    diagnosticWorkstation: "Diagnostic Workstation",
    lungsAssist: "Diagnostic pulmonaire assisté par IA",
    user: "Utilisateur",
    role: "Rôle",
    email: "Email",
    access: "Accès",
    active: "Actif",
    inactive: "Inactif",
    disclaimer: "Les résultats IA doivent être relus par un professionnel de santé autorisé.",
    recentAnalysesTitle: "Analyses récentes",
    viewAll: "Voir tout",
    totalExams: "Examens total",
    completedAnalyses: "Analyses terminées",
    criticalCases: "Cas critiques",
    normals: "Normaux",
    loading: "Chargement",
    api: "API",
    stable: "Stable",
    toReview: "A réviser",
    zeroAlert: "0 alerte",
    automated: "Automatisé",
    diagnosticsRepartition: "Répartition des diagnostics",
    pipelineStatus: "Statuts du pipeline",
    secureIntake: "Secure intake",
    importImages: "Importer des images médicales",
    secureDrop: "Dépôt sécurisé",
    chooseImages: "Choisir des images médicales",
    selectedSuffix: "sélectionné",
    selectedPluralSuffix: "sélectionnés",
    dicomFormatNote: "DICOM, PNG ou JPEG. Les fichiers sont anonymisés et chiffrés au repos.",
    importAndAnalyze: "Importer et analyser",
    importInProgress: "Import en cours...",
    noReport: "Aucun rapport disponible",
    intakePrompt: "Importez un examen pour générer une carte de résultat diagnostic.",
    startAnalysis: "Lancer une analyse",
    users: "Utilisateurs",
    refresh: "Actualiser",
    fullName: "Nom complet",
    emailAddress: "Adresse e-mail",
    addUser: "Ajouter un utilisateur",
    analysisHistory: "Historique des analyses",
    exportCsv: "Exporter CSV",
    searchPlaceholder: "Rechercher fichier",
    allStatuses: "Tous statuts",
    allDiagnostics: "Tous diagnostics",
    allSeverities: "Toutes sévérités",
    ambiguous: "Ambigus",
    page: "Page",
    prev: "Préc.",
    next: "Suiv.",
    activeNotifications: "Notifications actives",
    noNotification: "Aucune notification",
    read: "Lu",
    unread: "Non lu",
    analysisId: "Analyse ID",
    exam: "Examen",
    date: "Date",
    status: "Statut",
    result: "Résultat",
    confidence: "Confiance",
    normalSeverity: "Normal",
    suspectSeverity: "Suspect",
    criticalSeverity: "Critique",
    pendingStatus: "En attente",
    completedStatus: "Terminée",
    failedStatus: "Échouée",
    yes: "Oui",
    no: "Non",
    technicalSupport: "Assistance technique",
    diagnosticIA: "Diagnostic IA",
    conclusionIA: "Conclusion IA",
    pipeline: "Pipeline",
    performance: "Performance",
    responsible: "Responsable",
    diagnosticResult: "Diagnostic result",
    anonymizedExam: "Examen anonymisé",
    source: "Source",
    id: "ID",
    reset: "Reset",
    moveImage: "Déplacer l'image",
    zoomOut: "Réduire le zoom",
    zoomIn: "Agrandir le zoom",
    contrast: "Contraste",
    brightness: "Luminosité",
    showMeasure: "Afficher la mesure",
    resetView: "Réinitialiser la vue",
    exportAnnotated: "Exporter l'image annotée",
    noAnalysis: "Aucune analyse dans la session",
    importPrompt: "Importez une image médicale pour créer une ligne d'analyse.",
    newAnalysis: "Nouvelle analyse",
    noHistory: "Aucun historique disponible",
    historyPrompt: "Les analyses terminées apparaîtront ici avec leurs métadonnées."
  },
  ar: {
    overview: "لوحة التحكم",
    intake: "التحاليل",
    results: "التقارير",
    patients: "سجل التحاليل",
    admin: "الإعدادات",
    workspace: "مساحة العمل",
    diagnosticWorkstation: "محطة التشخيص",
    lungsAssist: "التشخيص الرئوي بمساعدة الذكاء الاصطناعي",
    user: "المستخدم",
    role: "الدور",
    email: "البريد الإلكتروني",
    access: "الصلاحية",
    active: "نشط",
    inactive: "غير نشط",
    disclaimer: "يجب مراجعة نتائج الذكاء الاصطناعي من قبل أخصائي صحي مرخص له.",
    recentAnalysesTitle: "التحاليل الأخيرة",
    viewAll: "عرض الكل",
    totalExams: "إجمالي الفحوصات",
    completedAnalyses: "التحاليل المكتملة",
    criticalCases: "الحالات الحرجة",
    normals: "سليم",
    loading: "جاري التحميل",
    api: "واجهة البرمجة",
    stable: "مستقر",
    toReview: "للمراجعة",
    zeroAlert: "لا توجد تنبيهات",
    automated: "تلقائي",
    diagnosticsRepartition: "توزيع التشخيصات",
    pipelineStatus: "حالات خط المعالجة",
    secureIntake: "إيداع آمن",
    importImages: "استيراد الصور الطبية",
    secureDrop: "إيداع آمن",
    chooseImages: "اختر صورًا طبية",
    selectedSuffix: "ملف تم اختياره",
    selectedPluralSuffix: "ملفات تم اختيارها",
    dicomFormatNote: "DICOM أو PNG أو JPEG. يتم إخفاء هوية الملفات وتشفيرها عند عدم النشاط.",
    importAndAnalyze: "استيراد وتحليل",
    importInProgress: "جاري الاستيراد...",
    noReport: "لا يوجد تقارير متاحة",
    intakePrompt: "استورد فحصًا لإنشاء بطاقة نتيجة التشخيص.",
    startAnalysis: "بدء التحليل",
    users: "المستخدمون",
    refresh: "تحديث",
    fullName: "الاسم الكامل",
    emailAddress: "البريد الإلكتروني",
    addUser: "إضافة مستخدم",
    analysisHistory: "سجل التحاليل",
    exportCsv: "تصدير CSV",
    searchPlaceholder: "البحث عن ملف",
    allStatuses: "جميع الحالات",
    allDiagnostics: "جميع التشخيصات",
    allSeverities: "جميع مستويات الخطورة",
    ambiguous: "غامض",
    page: "صفحة",
    prev: "السابق",
    next: "التالي",
    activeNotifications: "التنبيهات نشطة",
    noNotification: "لا توجد تنبيهات",
    read: "مقروء",
    unread: "غير مقروء",
    analysisId: "معرف التحليل",
    exam: "الفحص",
    date: "التاريخ",
    status: "الحالة",
    result: "النتيجة",
    confidence: "الثقة",
    normalSeverity: "سليم",
    suspectSeverity: "مشتبه به",
    criticalSeverity: "حرجة",
    pendingStatus: "قيد الانتظار",
    completedStatus: "مكتمل",
    failedStatus: "فشل",
    yes: "نعم",
    no: "لا",
    technicalSupport: "الدعم الفني",
    diagnosticIA: "ذكاء اصطناعي",
    conclusionIA: "استنتاج الذكاء الاصطناعي",
    pipeline: "خط المعالجة",
    performance: "الأداء",
    responsible: "المسؤول",
    diagnosticResult: "نتيجة التشخيص",
    anonymizedExam: "فحص مجهول الهوية",
    source: "المصدر",
    id: "الرقم",
    reset: "إعادة تعيين",
    moveImage: "تحريك الصورة",
    zoomOut: "تصغير",
    zoomIn: "تكبير",
    contrast: "التباين",
    brightness: "السطوع",
    showMeasure: "عرض القياس",
    resetView: "إعادة تعيين الرؤية",
    exportAnnotated: "تصدير الصورة المعلمة",
    noAnalysis: "لا توجد تحاليل في الجلسة",
    importPrompt: "استورد صورة طبية لإنشاء سطر تحليل.",
    newAnalysis: "تحليل جديد",
    noHistory: "سجل فارغ",
    historyPrompt: "ستظهر التحاليل المكتملة هنا مع بياناتها."
  }
};

const severityLabelMap: Record<string, { fr: string; ar: string }> = {
  Normal: { fr: "Normal", ar: "سليم" },
  Suspect: { fr: "Suspect", ar: "مشتبه به" },
  Critical: { fr: "Critique", ar: "حرج" },
  Critique: { fr: "Critique", ar: "حرج" },
  Pending: { fr: "En attente", ar: "قيد الانتظار" }
};

const statusLabelMap: Record<string, { fr: string; ar: string }> = {
  uploaded: { fr: "Importé", ar: "مستورد" },
  validation_failed: { fr: "Validation échouée", ar: "فشل التحقق" },
  validated: { fr: "Validé", ar: "تم التحقق" },
  anonymized: { fr: "Anonymisé", ar: "مجهول الهوية" },
  analyzed: { fr: "Analysé", ar: "محلل" }
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
  patients: "/historique",
  intake: "/analyses",
  results: "/resultats",
  admin: "/parametres"
};

const legacyRoutes: Record<string, PanelId> = {
  "/import-analyse": "intake",
  "/patients": "patients",
  "/gestion-utilisateurs": "admin",
  "/utilisateurs": "admin"
};

const dashboardPages: Array<{ id: PanelId; title: string; icon: IconName; adminOnly?: boolean }> = [
  { id: "overview", title: "Dashboard", icon: "dashboard" },
  { id: "intake", title: "Analyses", icon: "analysis" },
  { id: "results", title: "Reports", icon: "fileText" },
  { id: "patients", title: "Historique des analyses", icon: "patients" },
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

function roleLabel(role: User["role"], language: "fr" | "ar" = "fr") {
  const labels: Record<User["role"], { fr: string; ar: string }> = {
    doctor: { fr: "Médecin", ar: "طبيب" },
    technician: { fr: "Technicien", ar: "تقني" },
    admin: { fr: "Administrateur", ar: "مشرف" }
  };
  return labels[role] ? labels[role][language] : role;
}

function formatDate(value: string, language: "fr" | "ar" = "fr") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return language === "ar" ? "التاريخ غير متاح" : "Date indisponible";
  return new Intl.DateTimeFormat(language === "ar" ? "ar-TN" : "fr-FR", {
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

function predictionLabel(image: MedicalImage, language: "fr" | "ar" = "fr") {
  if (image.ai_analysis_status === "failed") {
    return language === "ar" ? "نموذج الذكاء الاصطناعي غير متاح" : "Modèle IA indisponible";
  }
  if (image.status !== "analyzed") {
    return language === "ar" ? "التحليل قيد الانتظار" : "Analyse en attente";
  }
  if (image.ai_prediction === "PNEUMONIA") {
    return language === "ar" ? "تم اكتشاف التهاب رئوي" : "Pneumonie détectée";
  }
  return language === "ar" ? "لا توجد علامات التهاب رئوي" : "Aucun signe de pneumonie";
}

function statusLabel(image: MedicalImage, language: "fr" | "ar" = "fr") {
  if (image.ai_analysis_status === "failed") return language === "ar" ? "الذكاء الاصطناعي غير متاح" : "IA indisponible";
  const labels: Record<MedicalImage["status"], { fr: string; ar: string }> = {
    uploaded: { fr: "Importé", ar: "مستورد" },
    validation_failed: { fr: "Validation échouée", ar: "فشل التحقق" },
    validated: { fr: "Validé", ar: "تم التحقق" },
    anonymized: { fr: "Anonymisé", ar: "مجهول الهوية" },
    analyzed: { fr: "Analysé", ar: "محلل" }
  };
  return labels[image.status] ? labels[image.status][language] : image.status;
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

function SeverityBadge({ severity, language = "fr" }: { severity: Severity; language?: "fr" | "ar" }) {
  const labels = {
    fr: { Normal: "Normal", Suspect: "Suspect", Critique: "Critique" },
    ar: { Normal: "سليم", Suspect: "مشتبه به", Critique: "حرج" }
  };
  const label = labels[language][severity] ?? severity;
  return <span className={`severity-badge ${severity.toLowerCase()}`}>{label}</span>;
}

function ConfidenceBar({ value, language = "fr" }: { value: number; language?: "fr" | "ar" }) {
  return (
    <div className="confidence-meter" aria-label={language === "ar" ? `مستوى الثقة ${value}%` : `Score de confiance ${value}%`}>
      <div className="confidence-meter-header">
        <span>{language === "ar" ? "ثقة الذكاء الاصطناعي" : "Confiance IA"}</span>
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

const ScanViewer = memo(function ScanViewer({ image, language = "fr" }: { image: MedicalImage; language?: "fr" | "ar" }) {
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

  const t = dashboardTranslations[language];

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
    <section className="scan-viewer-panel" aria-label={language === "ar" ? "عارض الصور" : "Visionneuse médicale"}>
      <div className="scan-toolbar" aria-label={language === "ar" ? "أدوات التصوير" : "Outils d'imagerie"}>
        <button
          aria-pressed={dragEnabled}
          aria-label={t.moveImage}
          className={`tool-button ${dragEnabled ? "active" : ""}`}
          onClick={() => setDragEnabled((enabled) => !enabled)}
          title={t.moveImage}
          type="button"
        >
          <Icon name="drag" />
        </button>
        <button
          aria-label={t.zoomOut}
          className="tool-button"
          disabled={zoom <= 0.75}
          onClick={() => changeZoom(-0.25)}
          title={t.zoomOut}
          type="button"
        >
          <Icon name="zoomOut" />
        </button>
        <button
          aria-label={t.zoomIn}
          className="tool-button"
          disabled={zoom >= 2.5}
          onClick={() => changeZoom(0.25)}
          title={t.zoomIn}
          type="button"
        >
          <Icon name="zoomIn" />
        </button>
        <button
          aria-label={language === "ar" ? "إعادة تعيين الزوم" : "Réinitialiser le zoom"}
          className="tool-button zoom-reset-button"
          onClick={() => setZoom(1)}
          title={language === "ar" ? "إعادة تعيين الزوم" : "Réinitialiser le zoom"}
          type="button"
        >
          {zoomPercent}%
        </button>
        <button
          aria-label={`${t.contrast} ${contrastPercent}%`}
          className={`tool-button ${contrast !== 1 ? "active" : ""}`}
          onClick={cycleContrast}
          title={`${t.contrast} ${contrastPercent}%`}
          type="button"
        >
          <Icon name="contrast" />
        </button>
        <button
          aria-label={`${t.brightness} ${brightnessPercent}%`}
          className={`tool-button ${brightness !== 1 ? "active" : ""}`}
          onClick={cycleBrightness}
          title={`${t.brightness} ${brightnessPercent}%`}
          type="button"
        >
          <Icon name="brightness" />
        </button>
        <button
          aria-pressed={measureEnabled}
          aria-label={t.showMeasure}
          className={`tool-button ${measureEnabled ? "active" : ""}`}
          onClick={() => setMeasureEnabled((enabled) => !enabled)}
          title={t.showMeasure}
          type="button"
        >
          <Icon name="measure" />
        </button>
        <button className="tool-button zoom-reset-button" onClick={resetViewer} title={t.resetView} type="button">
          {t.reset}
        </button>
        <button
          className="tool-button export-image-button"
          disabled={!canExport}
          onClick={exportAnnotatedImage}
          title={t.exportAnnotated}
          type="button"
        >
          {language === "ar" ? "صورة" : "PNG"}
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
            <div className="scan-skeleton" aria-label={language === "ar" ? "جاري تحميل الصورة..." : "Image en attente de chargement optimisé"} />
          ) : (
            <div className="scan-skeleton" />
          )}
          {image.ai_prediction === "PNEUMONIA" && (
            <div className="scan-annotation">
              <span>{language === "ar" ? "تعتيم مشتبه به" : "Opacité suspecte"}</span>
            </div>
          )}
          {measureEnabled && (
            <div className="scan-measurement" aria-hidden="true">
              <span>{language === "ar" ? "42 مم" : "42 mm"}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

const DiagnosticResultCard = memo(function DiagnosticResultCard({ image, user, language = "fr" }: { image: MedicalImage; user: User; language?: "fr" | "ar" }) {
  const [result, setResult] = useState(image);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const severity = getSeverity(result);
  const confidence = confidencePercent(result);
  const t = dashboardTranslations[language];

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

  async function handlePdfDownload() {
    setPdfDownloading(true);
    setPdfError("");
    try {
      await downloadReportPdf(result.id, result.original_filename);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : (language === "ar" ? "فشل تحميل تقرير PDF" : "Impossible de télécharger le rapport PDF"));
    } finally {
      setPdfDownloading(false);
    }
  }

  return (
    <article className="diagnostic-result-card">
      <header className="diagnostic-header">
        <div>
          <p className="section-kicker">{t.diagnosticResult}</p>
          <h3>{result.original_filename}</h3>
        </div>
        <div className="diagnostic-header-actions">
          <SeverityBadge severity={severity} language={language} />
          <button className="secondary" disabled={pdfDownloading} onClick={handlePdfDownload} type="button">
            {pdfDownloading ? (language === "ar" ? "جاري تحميل PDF..." : "PDF...") : "PDF"}
          </button>
        </div>
      </header>

      <div className="patient-info-row">
        <span>
          {language === "ar" ? "تحليل" : "Analyse"}
          <strong>{t.anonymizedExam}</strong>
        </span>
        <span>
          {t.source}
          <strong>{language === "ar" ? "غير متوفر" : "N/R"}</strong>
        </span>
        <span>
          {t.id}
          <strong>PFD-{String(result.id).padStart(5, "0")}</strong>
        </span>
        <span>
          {t.date}
          <strong>{formatDate(result.created_at, language)}</strong>
        </span>
      </div>

      <div className="diagnostic-body-grid">
        <div className="diagnostic-findings">
          {pdfError && <ClinicalAlert type="critical">{pdfError}</ClinicalAlert>}
          {result.ai_error_message && <ClinicalAlert type="warning">{result.ai_error_message}</ClinicalAlert>}
          <ConfidenceBar value={confidence} language={language} />
          <div className="finding-list">
            <div>
              <Icon name="activity" />
              <span>{t.conclusionIA}</span>
              <strong>{predictionLabel(result, language)}</strong>
            </div>
            <div>
              <Icon name="shield" />
              <span>{t.pipeline}</span>
              <strong>{statusLabel(result, language)}</strong>
            </div>
            <div>
              <Icon name="chart" />
              <span>{t.performance}</span>
              <strong>{result.ai_latency_ms ? `${result.ai_latency_ms} ms` : (language === "ar" ? "الاستجابة غير متوفرة" : "Latence N/R")}</strong>
            </div>
            <div>
              <Icon name="patients" />
              <span>{t.responsible}</span>
              <strong>{roleLabel(user.role, language)}</strong>
            </div>
          </div>
        </div>
        <ScanViewer image={result} language={language} />
      </div>
    </article>
  );
});

function PatientTable({ images, language = "fr", onAnalyze }: { images: MedicalImage[]; language?: "fr" | "ar"; onAnalyze: () => void }) {
  const t = dashboardTranslations[language];

  if (!images.length) {
    return (
      <div className="empty-state clinical-empty-state">
        <Icon name="patients" />
        <strong>{t.noAnalysis}</strong>
        <small>{t.importPrompt}</small>
        <button onClick={onAnalyze} type="button">
          <Icon name="plus" />
          {t.newAnalysis}
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
              {t.analysisId} <Icon name="chevronDown" />
            </th>
            <th>
              {t.exam} <Icon name="chevronDown" />
            </th>
            <th>
              {t.date} <Icon name="chevronDown" />
            </th>
            <th>
              {t.status} <Icon name="chevronDown" />
            </th>
            <th>
              {t.result} <Icon name="chevronDown" />
            </th>
            <th>{t.confidence}</th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => (
            <tr key={image.id}>
              <td className="mono">PFD-{String(image.id).padStart(5, "0")}</td>
              <td>{image.original_filename}</td>
              <td>{formatDate(image.created_at, language)}</td>
              <td>
                <span className={`status-pill ${image.ai_analysis_status === "failed" ? "warning" : image.status === "analyzed" ? "active" : "inactive"}`}>
                  {statusLabel(image, language)}
                </span>
              </td>
              <td>
                <SeverityBadge severity={getSeverity(image)} language={language} />
              </td>
              <td className="mono">{confidencePercent(image)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function historyStatusLabel(status: AnalysisHistory["analysis_status"], language: "fr" | "ar" = "fr") {
  const labels: Record<AnalysisHistory["analysis_status"], { fr: string; ar: string }> = {
    pending: { fr: "En attente", ar: "قيد الانتظار" },
    completed: { fr: "Terminée", ar: "مكتمل" },
    failed: { fr: "Échouée", ar: "فشل" }
  };
  return labels[status] ? labels[status][language] : status;
}

function HistoryTable({ page, language = "fr" }: { page: HistoryPage | null; language?: "fr" | "ar" }) {
  const items = page?.items ?? [];
  const t = dashboardTranslations[language];

  if (!items.length) {
    return (
      <div className="empty-state clinical-empty-state">
        <Icon name="patients" />
        <strong>{t.noHistory}</strong>
        <small>{t.historyPrompt}</small>
      </div>
    );
  }

  return (
    <div className="clinical-table-wrap">
      <table className="clinical-table">
        <thead>
          <tr>
            <th>{language === "ar" ? "التحليل" : "Analyse"}</th>
            <th>{t.date}</th>
            <th>{t.status}</th>
            <th>{language === "ar" ? "التشخيص" : "Diagnostic"}</th>
            <th>{t.confidence}</th>
            <th>{language === "ar" ? "مستوى الخطورة" : "Sévérité"}</th>
            <th>{t.ambiguous}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.original_filename}</td>
              <td>{formatDate(item.created_at, language)}</td>
              <td>
                <span className={`status-pill ${item.analysis_status === "failed" ? "warning" : item.analysis_status === "completed" ? "active" : "inactive"}`}>
                  {historyStatusLabel(item.analysis_status, language)}
                </span>
              </td>
              <td>
                {item.prediction === "PNEUMONIA" 
                  ? (language === "ar" ? "التهاب رئوي" : "PNEUMONIA") 
                  : item.prediction === "NORMAL" 
                    ? (language === "ar" ? "سليم" : "NORMAL") 
                    : (language === "ar" ? "غير متوفر" : "N/R")}
              </td>
              <td className="mono">{item.confidence != null ? `${Math.round(item.confidence * 100)}%` : (language === "ar" ? "غير متوفر" : "N/R")}</td>
              <td>
                {item.severity === "critical" 
                  ? (language === "ar" ? "حرجة" : "Critique") 
                  : item.severity === "suspect" 
                    ? (language === "ar" ? "مشتبه به" : "Suspect") 
                    : item.severity === "normal" 
                      ? (language === "ar" ? "سليم" : "Normal") 
                      : (language === "ar" ? "غير متوفر" : "N/R")}
              </td>
              <td>{item.is_ambiguous ? t.yes : t.no}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotificationCenter({
  notifications,
  preference,
  open,
  loading,
  onToggleOpen,
  onToggleRead,
  onTogglePreference,
  onRefresh,
  language = "fr"
}: {
  notifications: AppNotification[];
  preference: NotificationPreference | null;
  open: boolean;
  loading: boolean;
  onToggleOpen: () => void;
  onToggleRead: (notification: AppNotification) => void;
  onTogglePreference: () => void;
  onRefresh: () => void;
  language?: "fr" | "ar";
}) {
  const t = dashboardTranslations[language];
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="notification-center">
      <button className="icon-button notification-bell-button" aria-label="Notifications" onClick={onToggleOpen} type="button">
        <Icon name="bell" />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <section className="notification-popover" aria-label={language === "ar" ? "سجل التنبيهات" : "Historique des notifications"}>
          <div className="notification-popover-header">
            <div>
              <p className="section-kicker">Notifications</p>
              <h2>{language === "ar" ? "السجل" : "Historique"}</h2>
            </div>
            <button className="secondary" onClick={onRefresh} type="button">
              {t.refresh}
            </button>
          </div>

          <label className="notification-toggle">
            <input checked={preference?.notifications_enabled ?? true} onChange={onTogglePreference} type="checkbox" />
            {t.activeNotifications}
          </label>

          <div className="notification-list">
            {loading ? (
              <div className="table-skeleton" />
            ) : notifications.length ? (
              notifications.map((notification) => (
                <article className={`notification-item ${notification.category} ${notification.is_read ? "read" : "unread"}`} key={notification.id}>
                  <div>
                    <strong>{notification.title}</strong>
                    <small>{formatDate(notification.created_at, language)}</small>
                  </div>
                  <p>{notification.message}</p>
                  <button className="secondary" onClick={() => onToggleRead(notification)} type="button">
                    {notification.is_read ? t.unread : t.read}
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-state clinical-empty-state notification-empty-state">
                <Icon name="bell" />
                <strong>{t.noNotification}</strong>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export function DashboardPage({ user, language, onLanguageChange, onLogout }: Props) {
  const [activePanel, setActivePanel] = useState<PanelId>(() => routeToPanel(window.location.pathname));
  const t = dashboardTranslations[language];
  const [consentActive, setConsentActive] = useState(user.consent_granted);
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
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({ page: 1, page_size: 20 });
  const [historyPage, setHistoryPage] = useState<HistoryPage | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationPreference, setNotificationPreference] = useState<NotificationPreference | null>(null);

  const [adminSearch, setAdminSearch] = useState("");

  async function handleGrantConsent() {
    try {
      await grantConsent();
      setConsentActive(true);
      user.consent_granted = true;
      setSuccess(language === "ar" ? "تم تقديم الموافقة بنجاح." : "Consentement donné avec succès.");
      loadDashboardStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du consentement");
    }
  }

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
    loadNotifications();
    loadNotificationPreference();
  }, []);

  useEffect(() => {
    if (activePanel === "patients") {
      loadHistory();
    }
  }, [activePanel, historyFilters]);

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
      setError(language === "ar" ? "الرجاء اختيار صورة طبية واحدة على الأقل." : "Sélectionnez au moins une image médicale.");
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
      await loadNotifications();
      const aiFailures = response.images.filter((image) => image.ai_analysis_status === "failed");
      if (aiFailures.length) {
        setWarning(
          language === "ar"
            ? `تم استيراد ${response.images.length} ملف(ات). نموذج الذكاء الاصطناعي غير متوفر لـ ${aiFailures.length} تحليل(ات).`
            : `${response.images.length} fichier${response.images.length > 1 ? "s" : ""} importé${response.images.length > 1 ? "s" : ""}. ` +
              `Le modèle IA est indisponible pour ${aiFailures.length} analyse${aiFailures.length > 1 ? "s" : ""}.`
        );
      } else {
        setSuccess(
          language === "ar"
            ? `تم استيراد ${response.images.length} ملف(ات) بنجاح.`
            : `${response.images.length} fichier${response.images.length > 1 ? "s" : ""} importé${response.images.length > 1 ? "s" : ""} avec succès.`
        );
      }
      setSelectedFiles([]);
      navigateTo("results");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : (language === "ar" ? "فشل الاستيراد" : "Échec de l'import")
      );
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

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      setHistoryPage(await listAnalysisHistory(historyFilters));
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Impossible de charger l'historique");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadNotifications() {
    setNotificationsLoading(true);
    try {
      setNotifications(await listNotifications({ limit: 20 }));
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function loadNotificationPreference() {
    try {
      setNotificationPreference(await getNotificationPreference());
    } catch {
      setNotificationPreference({ notifications_enabled: true });
    }
  }

  async function handleNotificationReadToggle(notification: AppNotification) {
    const updated = notification.is_read ? await markNotificationUnread(notification.id) : await markNotificationRead(notification.id);
    setNotifications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleNotificationPreferenceToggle() {
    const nextValue = !(notificationPreference?.notifications_enabled ?? true);
    setNotificationPreference(await updateNotificationPreference(nextValue));
  }

  function updateHistoryFilters(patch: HistoryFilters) {
    setHistoryFilters((current) => ({ ...current, ...patch, page: 1 }));
  }

  function setHistoryPageNumber(page: number) {
    setHistoryFilters((current) => ({ ...current, page }));
  }

  async function handleHistoryExport() {
    setHistoryExporting(true);
    setError("");
    try {
      await exportHistoryCsv(historyFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === "ar" ? "فشل تصدير سجل التحاليل بصيغة CSV" : "Impossible d'exporter l'historique CSV"));
    } finally {
      setHistoryExporting(false);
    }
  }

  function renderOverview() {
    const metrics = [
      { label: t.totalExams, value: totalExams, trend: statsLoading ? t.loading : t.api, tone: "positive" },
      { label: t.completedAnalyses, value: analyzedCount, trend: t.stable, tone: "neutral" },
      { label: t.criticalCases, value: criticalCount, trend: criticalCount ? t.toReview : t.zeroAlert, tone: criticalCount ? "critical" : "positive" },
      { label: t.normals, value: normalCount, trend: t.automated, tone: "positive" }
    ];
    const severityLabels = dashboardStats?.severity_breakdown.map((item) => item.label) ?? ["Normal", "Suspect", "Critical", "Pending"];
    const translatedSeverityLabels = severityLabels.map(label => {
      const normalized = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
      return severityLabelMap[normalized]?.[language] ?? label;
    });
    const severityValues = dashboardStats?.severity_breakdown.map((item) => item.value) ?? [
      normalCount,
      displayedImages.filter((image) => getSeverity(image) === "Suspect").length,
      criticalCount,
      displayedImages.filter((image) => image.status !== "analyzed").length
    ];
    const statusLabels = dashboardStats?.status_breakdown.map((item) => item.label) ?? ["uploaded", "validated", "anonymized", "analyzed"];
    const translatedStatusLabels = statusLabels.map(label => {
      return statusLabelMap[label]?.[language] ?? label;
    });
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
            labels={translatedSeverityLabels}
            title={t.diagnosticsRepartition}
            type="doughnut"
            values={severityValues}
          />
          <DashboardChart
            colors={["#94a3b8", "#38bdf8", "#14b8a6", "#2563eb", "#f97316"]}
            labels={translatedStatusLabels}
            title={t.pipelineStatus}
            type="bar"
            values={statusValues}
          />
        </div>

        <section className="clinical-panel overview-profile-panel">
          <div>
            <p className="section-kicker">{language === "ar" ? "الجلسة السريرية" : "Session clinique"}</p>
            <h2>{t.lungsAssist}</h2>
          </div>
          <div className="profile-data-grid">
            <span>
              {t.user}
              <strong>{user.full_name}</strong>
            </span>
            <span>
              {t.role}
              <strong>{roleLabel(user.role, language)}</strong>
            </span>
            <span>
              {t.email}
              <strong>{user.email}</strong>
            </span>
            <span>
              {t.access}
              <strong>{user.is_active ? t.active : t.inactive}</strong>
            </span>
          </div>
          <ClinicalAlert type="info">{t.disclaimer}</ClinicalAlert>
        </section>

        <section className="clinical-panel">
          <div className="panel-heading-row">
            <div>
              <p className="section-kicker">{language === "ar" ? "سجل التحاليل" : "Analysis history"}</p>
              <h2>{t.recentAnalysesTitle}</h2>
            </div>
            <button className="secondary" onClick={() => navigateTo("patients")} type="button">
              {t.viewAll}
            </button>
          </div>
          <PatientTable images={recentAnalyses} language={language} onAnalyze={() => navigateTo("intake")} />
        </section>
      </div>
    );
  }

  function renderIntake() {
    return (
      <section className="clinical-panel intake-panel">
        <div>
          <p className="section-kicker">{t.secureIntake}</p>
          <h2>{t.importImages}</h2>
        </div>

        <label className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <input
            accept=".dcm,.png,.jpg,.jpeg,application/dicom,image/png,image/jpeg"
            multiple
            onChange={(event) => selectFiles(event.target.files)}
            type="file"
          />
          <Icon name="upload" />
          <span>{t.secureDrop}</span>
          <strong>{selectedFiles.length ? `${selectedFiles.length} ${selectedFiles.length > 1 ? t.selectedPluralSuffix : t.selectedSuffix}` : t.chooseImages}</strong>
          <small>{t.dicomFormatNote}</small>
        </label>

        {selectedFiles.length > 0 && (
          <ul className="file-list">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`}>
                <span>{file.name}</span>
                <small>{Math.ceil(file.size / 1024)} {language === "ar" ? "كيلو بايت" : "Ko"}</small>
              </li>
            ))}
          </ul>
        )}

        <div className="upload-actions">
          <button disabled={uploading} onClick={handleUpload} type="button">
            {uploading ? t.importInProgress : t.importAndAnalyze}
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
          <strong>{t.noReport}</strong>
          <small>{t.intakePrompt}</small>
          <button onClick={() => navigateTo("intake")} type="button">
            <Icon name="plus" />
            {t.startAnalysis}
          </button>
        </div>
      );
    }

    return (
      <div className="results-stack">
        {warning && <ClinicalAlert type="warning">{warning}</ClinicalAlert>}
        {uploadedImages.map((image) => (
          <DiagnosticResultCard image={image} key={image.id} user={user} language={language} />
        ))}
      </div>
    );
  }

  function renderAdmin() {
    const filteredUsers = users.filter((u) => {
      const term = adminSearch.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    });

    return (
      <div className="settings-dashboard-grid">
        <div className="settings-main-column">
          <section className="clinical-panel">
            <div className="panel-heading-row" style={{ marginBottom: "16px" }}>
              <div>
                <p className="section-kicker">{language === "ar" ? "إدارة الوصول" : "Access control"}</p>
                <h2>{t.users}</h2>
              </div>
              <button className="secondary" onClick={loadUsers} type="button">
                {t.refresh}
              </button>
            </div>

            <div className="settings-search-bar">
              <input
                type="text"
                placeholder={language === "ar" ? "البحث بالاسم أو البريد..." : "Rechercher par nom ou email..."}
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
            </div>

            {usersError && <ClinicalAlert type="critical">{usersError}</ClinicalAlert>}

            {usersLoading ? (
              <div className="table-skeleton" style={{ height: "200px" }} />
            ) : filteredUsers.length > 0 ? (
              <div className="user-cards-grid">
                {filteredUsers.map((managedUser) => {
                  const initials = managedUser.full_name.trim().split(" ").map(w => w.charAt(0)).join("").toUpperCase().slice(0, 2) || "U";
                  const isActive = managedUser.is_active;

                  return (
                    <article className="user-profile-card" key={managedUser.id}>
                      <div className="user-card-header">
                        <div className={`user-avatar-circle role-${managedUser.role}`}>
                          {initials}
                        </div>
                        <div className="user-card-identity">
                          <strong>{managedUser.full_name}</strong>
                          <span>{managedUser.email}</span>
                        </div>
                      </div>
                      
                      <div className="user-card-badges">
                        <span className={`status-pill ${isActive ? "active" : "inactive"}`}>
                          {isActive ? t.active : t.inactive}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state clinical-empty-state">
                <Icon name="patients" />
                <strong>{language === "ar" ? "لا يوجد مستخدمون مطابقة." : "Aucun utilisateur trouvé."}</strong>
              </div>
            )}
          </section>
        </div>

        <div className="settings-sidebar-column">
          <section className="clinical-panel create-user-panel" style={{ borderTop: 0, paddingTop: 0 }}>
            <div style={{ marginBottom: "16px" }}>
              <h2>{t.addUser}</h2>
            </div>
            <RegisterPage mode="admin" language={language} onRegistered={loadUsers} />
          </section>
        </div>
      </div>
    );
  }

  function renderPage(panel: PanelId) {
    if (!consentActive) {
      return (
        <div className="clinical-empty-state empty-state" style={{ padding: "48px 24px", maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
          <Icon name="shield" />
          <strong style={{ fontSize: "1.4rem", display: "block", margin: "16px 0 8px" }}>
            {language === "ar" ? "الموافقة على معالجة البيانات مطلوبة" : "Consentement requis"}
          </strong>
          <p style={{ color: "#64748b", margin: "0 0 24px 0", lineHeight: "1.5" }}>
            {language === "ar" 
              ? "الموافقة على معالجة البيانات الصحية مطلوبة للوصول إلى لوحة التحكم والتشخيص. يرجى تقديم موافقتك للمتابعة." 
              : "Le consentement au traitement des données de santé est obligatoire pour utiliser le poste de diagnostic. Veuillez accorder votre consentement pour continuer."}
          </p>
          <button className="primary" onClick={handleGrantConsent} type="button" style={{ padding: "10px 24px", fontSize: "1rem" }}>
            {language === "ar" ? "تقديم الموافقة" : "Donner mon consentement"}
          </button>
        </div>
      );
    }
    if (panel === "overview") return renderOverview();
    if (panel === "patients") {
      return (
        <section className="clinical-panel">
          <div className="panel-heading-row">
            <div>
              <p className="section-kicker">{t.analysisHistory}</p>
              <h2>{t.analysisHistory}</h2>
            </div>
            <button className="secondary" disabled={historyExporting} onClick={handleHistoryExport} type="button">
              {historyExporting ? (language === "ar" ? "تصدير..." : "Export...") : t.exportCsv}
            </button>
          </div>
          <div className="history-filters">
            <input
              aria-label="Recherche historique"
              onChange={(event) => updateHistoryFilters({ search: event.target.value })}
              placeholder={t.searchPlaceholder}
              type="search"
              value={historyFilters.search ?? ""}
            />
            <select
              aria-label="Filtrer par statut"
              onChange={(event) => updateHistoryFilters({ status: event.target.value as HistoryFilters["status"] })}
              value={historyFilters.status ?? ""}
            >
              <option value="">{t.allStatuses}</option>
              <option value="completed">{language === "ar" ? "مكتملة" : "Terminees"}</option>
              <option value="pending">{language === "ar" ? "قيد الانتظار" : "En attente"}</option>
              <option value="failed">{language === "ar" ? "فشلت" : "Echouees"}</option>
            </select>
            <select
              aria-label="Filtrer par diagnostic"
              onChange={(event) => updateHistoryFilters({ prediction: event.target.value })}
              value={historyFilters.prediction ?? ""}
            >
              <option value="">{t.allDiagnostics}</option>
              <option value="PNEUMONIA">{language === "ar" ? "التهاب رئوي" : "Pneumonie"}</option>
              <option value="NORMAL">{language === "ar" ? "سليم" : "Normal"}</option>
            </select>
            <select
              aria-label="Filtrer par severite"
              onChange={(event) => updateHistoryFilters({ severity: event.target.value })}
              value={historyFilters.severity ?? ""}
            >
              <option value="">{t.allSeverities}</option>
              <option value="critical">{language === "ar" ? "حرجة" : "Critique"}</option>
              <option value="suspect">{language === "ar" ? "مشتبه به" : "Suspect"}</option>
              <option value="normal">{language === "ar" ? "سليم" : "Normal"}</option>
            </select>
            <label className="history-checkbox">
              <input
                checked={historyFilters.ambiguous === true}
                onChange={(event) => updateHistoryFilters({ ambiguous: event.target.checked ? true : "" })}
                type="checkbox"
              />
              {t.ambiguous}
            </label>
          </div>
          {error && <ClinicalAlert type="critical">{error}</ClinicalAlert>}
          {historyError && <ClinicalAlert type="critical">{historyError}</ClinicalAlert>}
          {historyLoading ? <div className="table-skeleton" /> : <HistoryTable page={historyPage} language={language} />}
          <div className="history-pagination">
            <span className="mono">
              {t.page} {historyPage?.page ?? historyFilters.page ?? 1} / {historyPage?.total_pages ?? 0}
            </span>
            <div>
              <button
                className="secondary"
                disabled={!historyPage || historyPage.page <= 1}
                onClick={() => setHistoryPageNumber((historyPage?.page ?? 1) - 1)}
                type="button"
              >
                {t.prev}
              </button>
              <button
                className="secondary"
                disabled={!historyPage || historyPage.page >= historyPage.total_pages}
                onClick={() => setHistoryPageNumber((historyPage?.page ?? 1) + 1)}
                type="button"
              >
                {t.next}
              </button>
            </div>
          </div>
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
  const patientBadge = latestImage ? `PFD-${String(latestImage.id).padStart(5, "0")}` : t.noAnalysis;

  return (
    <main className="clinical-shell" dir={language === "ar" ? "rtl" : "ltr"}>
      <aside className="clinical-sidebar">
        <div className="clinical-brand">
          <span>
            <Icon name="lungs" />
          </span>
          <div>
            <strong>PulmoDiag AI</strong>
            <small>{language === "ar" ? "محطة التشخيص" : "Diagnostic Workstation"}</small>
          </div>
        </div>

        <nav className="clinical-side-menu" aria-label={language === "ar" ? "التنقل في لوحة التحكم" : "Navigation du tableau de bord"}>
          <span className="sidebar-section-label">{t.workspace}</span>
          {visiblePages.map((page) => (
            <button className={activePanel === page.id ? "active" : ""} key={page.id} onClick={() => navigateTo(page.id)} type="button">
              <Icon name={page.icon} />
              <span>{dashboardTranslations[language][page.id] || page.title}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-user-card" aria-label={language === "ar" ? "المستخدم المتصل" : "Utilisateur connecte"}>
          <span>{userInitial}</span>
          <div>
            <strong>{user.full_name}</strong>
            <small>{roleLabel(user.role, language)}</small>
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
            <span>{t.lungsAssist}</span>
            <h1>{dashboardTranslations[language][activePage.id] || activePage.title}</h1>
          </div>

          <div className="clinical-top-actions">
            <span className="patient-id-badge">{patientBadge}</span>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 4px" }} className="dashboard-language-selector">
              <button
                type="button"
                onClick={() => onLanguageChange("fr")}
                className={`lang-select-btn ${language === "fr" ? "active" : ""}`}
                title="Passer en Français"
                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <img src="/france.svg" alt="FR" style={{ width: "16px", height: "11px", objectFit: "cover", borderRadius: "1px" }} />
                <span>FR</span>
              </button>
              <span className="lang-divider">|</span>
              <button
                type="button"
                onClick={() => onLanguageChange("ar")}
                className={`lang-select-btn ${language === "ar" ? "active" : ""}`}
                title="التحويل إلى العربية"
                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <img src="/tunisia.svg" alt="AR" style={{ width: "16px", height: "11px", objectFit: "cover", borderRadius: "1px" }} />
                <span>AR</span>
              </button>
            </div>

            <NotificationCenter
              loading={notificationsLoading}
              notifications={notifications}
              onRefresh={loadNotifications}
              onToggleOpen={() => setNotificationsOpen((current) => !current)}
              onTogglePreference={handleNotificationPreferenceToggle}
              onToggleRead={handleNotificationReadToggle}
              open={notificationsOpen}
              preference={notificationPreference}
              language={language}
            />
            <span className="doctor-avatar" aria-label={language === "ar" ? `الطبيب ${user.full_name}` : `Docteur ${user.full_name}`}>
              {userInitial}
            </span>
            <button className="icon-button destructive" aria-label={language === "ar" ? "تسجيل الخروج" : "Deconnexion"} onClick={onLogout} type="button">
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <section className="clinical-main-panel">{renderPage(activePage.id)}</section>
      </section>
    </main>
  );
}

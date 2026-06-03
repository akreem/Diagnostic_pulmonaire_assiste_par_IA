const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const TOKEN_KEY = "pfd_access_token";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "doctor" | "technician" | "admin";
  is_active: boolean;
  consent_granted: boolean;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type MedicalImage = {
  id: number;
  original_filename: string;
  content_type: string;
  file_extension: string;
  file_size_bytes: number;
  status: "uploaded" | "validation_failed" | "validated" | "anonymized" | "analyzed";
  created_at: string;
  ai_prediction?: string | null;
  ai_confidence?: number | null;
  ai_latency_ms?: number | null;
  ai_gradcam_path?: string | null;
  is_ambiguous?: boolean;
  ai_analysis_status?: "pending" | "completed" | "failed";
  ai_error_message?: string | null;
};

export type UploadBatchResponse = {
  images: MedicalImage[];
};

export type DashboardBreakdownItem = {
  label: string;
  value: number;
};

export type DashboardStats = {
  total_exams: number;
  analyzed_count: number;
  normal_count: number;
  suspect_count: number;
  critical_count: number;
  pending_count: number;
  ambiguous_count: number;
  average_confidence?: number | null;
  average_latency_ms?: number | null;
  severity_breakdown: DashboardBreakdownItem[];
  status_breakdown: DashboardBreakdownItem[];
  recent_analyses: MedicalImage[];
};

export type AnalysisHistoryStatus = "pending" | "completed" | "failed";

export type AnalysisHistory = {
  id: number;
  owner_user_id: number;
  medical_image_id: number;
  original_filename: string;
  analysis_status: AnalysisHistoryStatus;
  prediction?: string | null;
  confidence?: number | null;
  latency_ms?: number | null;
  severity?: string | null;
  is_ambiguous: boolean;
  error_message?: string | null;
  gradcam_path?: string | null;
  created_at: string;
  completed_at?: string | null;
};

export type HistoryPage = {
  items: AnalysisHistory[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type HistoryFilters = {
  status?: AnalysisHistoryStatus | "";
  prediction?: string;
  severity?: string;
  ambiguous?: boolean | "";
  search?: string;
  page?: number;
  page_size?: number;
};

export type AppNotification = {
  id: number;
  owner_user_id: number;
  title: string;
  message: string;
  category: "info" | "success" | "warning" | "critical" | string;
  resource_type?: string | null;
  resource_id?: string | null;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
};

export type NotificationPreference = {
  notifications_enabled: boolean;
};

export type SetupStatus = {
  has_admin: boolean;
};

type ApiErrorDetail = string | {
  code?: string;
  message?: string;
  suggestion?: string;
  message_fr?: string;
  suggestion_fr?: string;
};

const errorTranslations: Record<string, string> = {
  "Request failed": "La requête a échoué",
  "Upload failed": "Échec de l'import",
  "Invalid email or password": "Adresse e-mail ou mot de passe invalide",
  "Email already registered": "Cette adresse e-mail est déjà enregistrée",
  "Authentication required": "Authentification requise",
  "Admin role required": "Rôle administrateur requis",
  "Create an administrator account to initialize the app": "Créez un compte administrateur pour initialiser l'application",
  "Invalid authentication token": "Jeton d'authentification invalide",
  "Invalid token subject": "Sujet du jeton invalide",
  "Inactive or missing user": "Utilisateur inactif ou introuvable",
  "Failed to load medical image": "Impossible de charger l'image médicale",
  "Failed to load Grad-CAM image": "Impossible de charger l'image Grad-CAM",
  "Le consentement au traitement des données de santé est obligatoire pour s'inscrire.": "Le consentement au traitement des données de santé est obligatoire pour s'inscrire.",
  "Le consentement au traitement des données de santé est obligatoire pour cette opération.": "Le consentement au traitement des données de santé est obligatoire pour cette opération."
};

function translateError(message: string): string {
  return errorTranslations[message] ?? message;
}

function formatApiError(detail: ApiErrorDetail | undefined): string {
  if (!detail) {
    return translateError("Request failed");
  }
  if (typeof detail === "string") {
    return translateError(detail);
  }

  const message = detail.message_fr ?? detail.message ?? "Request failed";
  const suggestion = detail.suggestion_fr ?? detail.suggestion;
  return suggestion ? `${translateError(message)} ${suggestion}` : translateError(message);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(formatApiError(error.detail));
  }

  return response.json() as Promise<T>;
}

export function registerUser(payload: {
  email: string;
  full_name: string;
  password: string;
  role: User["role"];
  consent_granted?: boolean;
}): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function withdrawConsent(): Promise<{ status: string }> {
  return request<{ status: string }>("/auth/consent/withdraw", { method: "POST" });
}

export function grantConsent(): Promise<{ status: string }> {
  return request<{ status: string }>("/auth/consent/grant", { method: "POST" });
}

export function getSetupStatus(): Promise<SetupStatus> {
  return request<SetupStatus>("/auth/setup-status");
}

export function loginUser(payload: { email: string; password: string; consent_granted: boolean }): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
}

export function listUsers(): Promise<User[]> {
  return request<User[]>("/auth/users");
}

export function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/dashboard/stats");
}

export function getAnalysisResult(imageId: number): Promise<MedicalImage> {
  return request<MedicalImage>(`/results/${imageId}`);
}

function historyQueryString(filters: HistoryFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listAnalysisHistory(filters: HistoryFilters = {}): Promise<HistoryPage> {
  return request<HistoryPage>(`/history${historyQueryString(filters)}`);
}

export function listNotifications(options: { unread_only?: boolean; limit?: number; offset?: number } = {}): Promise<AppNotification[]> {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined) return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return request<AppNotification[]>(`/notifications${query ? `?${query}` : ""}`);
}

export function getNotificationPreference(): Promise<NotificationPreference> {
  return request<NotificationPreference>("/notifications/preferences");
}

export function updateNotificationPreference(notificationsEnabled: boolean): Promise<NotificationPreference> {
  return request<NotificationPreference>("/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify({ notifications_enabled: notificationsEnabled })
  });
}

export function markNotificationRead(notificationId: number): Promise<AppNotification> {
  return request<AppNotification>(`/notifications/${notificationId}/read`, { method: "PATCH" });
}

export function markNotificationUnread(notificationId: number): Promise<AppNotification> {
  return request<AppNotification>(`/notifications/${notificationId}/unread`, { method: "PATCH" });
}

export async function exportHistoryCsv(filters: HistoryFilters = {}): Promise<void> {
  const token = getToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/history/export.csv${historyQueryString(filters)}`, { headers });
  if (!response.ok) {
    throw new Error(translateError("Request failed"));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `analysis-history-${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadReportPdf(imageId: number, filenameSeed: string): Promise<void> {
  const token = getToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/report/${imageId}/pdf`, { headers });
  if (!response.ok) {
    throw new Error(translateError("Request failed"));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = filenameSeed.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  link.href = url;
  link.download = `${safeName || "analysis"}-report.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function logoutUser(): Promise<void> {
  const token = getToken();
  if (token) {
    await request<{ status: string }>("/auth/logout", { method: "POST" }).catch(() => undefined);
  }
  clearToken();
}

export function uploadMedicalImages(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<UploadBatchResponse> {
  const token = getToken();
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/upload`);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let payload: { detail?: ApiErrorDetail } | UploadBatchResponse = {};
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        payload = { detail: "Upload failed" };
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as UploadBatchResponse);
        return;
      }
      reject(new Error("detail" in payload ? formatApiError(payload.detail) : translateError("Upload failed")));
    };

    xhr.onerror = () => reject(new Error(translateError("Upload failed")));
    xhr.send(formData);
  });
}

export async function getGradcamImage(imageId: number): Promise<string> {
  return getProtectedImageObjectUrl(`/upload/${imageId}/gradcam`, "Failed to load Grad-CAM image");
}

export async function getMedicalImage(imageId: number): Promise<string> {
  return getProtectedImageObjectUrl(`/upload/${imageId}/image`, "Failed to load medical image");
}

async function getProtectedImageObjectUrl(path: string, fallbackError: string): Promise<string> {
  const token = getToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers
  });

  if (!response.ok) {
    throw new Error(translateError(fallbackError));
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

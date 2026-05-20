const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const TOKEN_KEY = "pfd_access_token";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "doctor" | "technician" | "admin";
  is_active: boolean;
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
  status: "uploaded" | "validation_failed" | "validated" | "anonymized";
  created_at: string;
};

export type UploadBatchResponse = {
  images: MedicalImage[];
};

type ApiErrorDetail = string | {
  code?: string;
  message?: string;
  suggestion?: string;
  message_fr?: string;
  suggestion_fr?: string;
};

function formatApiError(detail: ApiErrorDetail | undefined): string {
  if (!detail) {
    return "Request failed";
  }
  if (typeof detail === "string") {
    return detail;
  }

  const message = detail.message ?? "Request failed";
  return detail.suggestion ? `${message} ${detail.suggestion}` : message;
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
}): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
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
      reject(new Error("detail" in payload ? formatApiError(payload.detail) : "Upload failed"));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
}

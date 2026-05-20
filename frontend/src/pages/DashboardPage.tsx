import { DragEvent, useState } from "react";

import { MedicalImage, uploadMedicalImages, User } from "../services/api";

type Props = {
  user: User;
  onLogout: () => void;
};

export function DashboardPage({ user, onLogout }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<MedicalImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError("Select at least one medical image.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const response = await uploadMedicalImages(selectedFiles, setUploadProgress);
      setUploadedImages(response.images);
      setSuccess(`${response.images.length} file${response.images.length > 1 ? "s" : ""} uploaded securely.`);
      setSelectedFiles([]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">Sprint 2 Upload</p>
          <h1>Pulmonary Diagnostic AI</h1>
        </div>
        <button className="secondary" onClick={onLogout} type="button">
          Logout
        </button>
      </header>

      <section className="overview-grid">
        <article>
          <span>Signed in as</span>
          <strong>{user.full_name}</strong>
          <small>{user.email}</small>
        </article>
        <article>
          <span>Role</span>
          <strong>{user.role}</strong>
          <small>RBAC-ready account</small>
        </article>
        <article>
          <span>Next sprint path</span>
          <strong>Image upload</strong>
          <small>DICOM, PNG, JPG validation</small>
        </article>
      </section>

      <section className="upload-workspace">
        <div className="section-heading">
          <p className="eyebrow">Medical image intake</p>
          <h2>Upload DICOM, PNG, or JPG files</h2>
        </div>

        <label
          className="dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            accept=".dcm,.png,.jpg,.jpeg,application/dicom,image/png,image/jpeg"
            multiple
            onChange={(event) => selectFiles(event.target.files)}
            type="file"
          />
          <span>Drop files here</span>
          <strong>{selectedFiles.length ? `${selectedFiles.length} selected` : "Choose medical images"}</strong>
        </label>

        {selectedFiles.length > 0 && (
          <ul className="file-list">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`}>
                <span>{file.name}</span>
                <small>{Math.ceil(file.size / 1024)} KB</small>
              </li>
            ))}
          </ul>
        )}

        <div className="upload-actions">
          <button disabled={uploading} onClick={handleUpload} type="button">
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <div aria-label="Upload progress" className="progress-track">
            <span style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {uploadedImages.length > 0 && (
          <div className="upload-results">
            {uploadedImages.map((image) => (
              <article key={image.id}>
                <span>{image.original_filename}</span>
                <strong>{image.status}</strong>
                <small>{Math.ceil(image.file_size_bytes / 1024)} KB encrypted at rest</small>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

# Sprint 2 Upload Error Catalog

Upload errors are returned as structured JSON in `detail`:

```json
{
  "code": "upload_unsupported_file_type",
  "message": "This file extension is not supported.",
  "message_fr": "Cette extension de fichier n'est pas prise en charge.",
  "suggestion": "Use a DICOM, PNG, JPG, or JPEG file.",
  "suggestion_fr": "Utilisez un fichier DICOM, PNG, JPG ou JPEG."
}
```

## Error Codes

| HTTP | Code | Meaning |
| ---: | --- | --- |
| 400 | `upload_no_files` | No files were submitted. |
| 401 | FastAPI auth error | Missing or invalid bearer token. |
| 413 | `upload_file_too_large` | File exceeds `UPLOAD_MAX_FILE_SIZE_BYTES`. |
| 415 | `upload_unsupported_file_type` | Unsupported extension. |
| 415 | `upload_unsupported_content_type` | Unsupported MIME/content type. |
| 415 | `upload_empty_file` | File content is empty. |
| 415 | `upload_invalid_png_signature` | PNG signature does not match the file type. |
| 415 | `upload_invalid_jpeg_signature` | JPEG signature does not match the file type. |
| 422 | `dicom_missing_marker` | DICOM preamble marker is missing. |
| 422 | `dicom_corrupted` | DICOM payload is corrupted or incomplete. |
| 422 | `dicom_missing_required_metadata` | Required DICOM metadata is absent. |
| 500 | `upload_storage_failed` | Secure storage failed after validation. |

## Logging Rules

- Do not log raw patient identifiers.
- Do not log user-provided filenames in audit metadata.
- Log stable error codes, content type, actor user ID, and action name.
- Keep server-side failures user-readable without stack traces in API responses.

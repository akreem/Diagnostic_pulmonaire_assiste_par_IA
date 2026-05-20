# Sprint 2 RGPD Anonymization Notes

## Scope

Sprint 2 anonymizes DICOM metadata during upload before encrypted storage. This work is implemented in `app/` only and does not modify the existing `model/` workspace.

## Implemented Controls

| Control | Implementation |
| --- | --- |
| Sensitive DICOM tags | `app/backend/app/services/dicom_anonymization.py` removes direct identifiers, private tags, dates/times, institution/provider identifiers, patient demographics, and accession/study identifiers. |
| Anonymous patient ID | Each DICOM upload receives an `ANON-*` patient identifier before storage. |
| Reversible mapping | Original `PatientID` is stored in `patient_identity_maps.encrypted_original_patient_id` using application encryption. |
| Admin-only re-identification | `GET /patient-identities/{anonymous_patient_id}` requires the admin role. |
| Audit trail | Upload anonymization and admin re-identification actions are written to `audit_logs`. Patient values are not written to audit metadata. |
| Storage | Anonymized DICOM bytes are encrypted before writing to `UPLOAD_STORAGE_DIR`. |

## Metadata Kept

The backend preserves technical metadata needed by the medical pipeline, including fields such as `Modality` and available acquisition/image structure metadata. Patient identifiers are replaced or removed before persistence.

## Validation Evidence

Automated tests generate synthetic DICOM files in memory and verify:

- valid DICOM uploads become `anonymized`;
- original patient IDs are not present in stored encrypted/anonymized content;
- mapping values are encrypted at rest;
- non-admin users cannot re-identify patients;
- admin re-identification is audited.

Manual supervisor/security validation remains a Sprint 2 checklist task.

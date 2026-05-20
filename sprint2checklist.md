# Sprint 2 Checklist - Donnees & Pretraitement

Sprint goal: build the medical image ingestion pipeline for DICOM, PNG, and JPG uploads, with validation, RGPD anonymization, secure storage, and clear upload error handling.

Scope note: `US-009` and `US-041` are already completed for the deployed Phase 1 model in the existing `model/` workspace. Sprint 2 backend/frontend work must stay synchronized with the model outputs and expectations, but must not modify anything inside `model/`. Evidence is summarized in `app/docs/us009_model_evidence.md` and `app/docs/us041_dataset_evidence.md`.

Status legend:

- `[ ]` To do
- `[x]` Done
- `[~]` Partial
- `[!]` Blocked
- `[-]` Out of scope for this sprint execution

Active sprint capacity: 148h planned here, excluding 22h for `US-009` because preprocessing, normalization, and augmentation are already done in `model/`.

## US-006 - Medical Image Upload

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-006.1 | Design `MedicalImage` data model | SQLAlchemy | 2h | Added upload metadata model with owner, filename, storage, checksum, status, and timestamps |
| [x] | T-006.2 | Create database migration | Alembic | 1h | Added `0002_medical_images` migration |
| [x] | T-006.3 | Implement `POST /upload` API endpoint | FastAPI | 4h | Added authenticated multi-file upload endpoint |
| [x] | T-006.4 | Validate file types | Python | 2h | Accepts `.dcm`, `.png`, `.jpg`, `.jpeg`; validates PNG/JPEG signatures and size |
| [x] | T-006.5 | Configure secure storage | Storage | 3h | Added configurable encrypted local storage under `UPLOAD_STORAGE_DIR` |
| [x] | T-006.6 | Create upload frontend component | React | 4h | Added dashboard drag and drop upload panel tied to authenticated session |
| [x] | T-006.7 | Implement upload progress bar | JS/Frontend | 2h | Added XHR upload progress tracking |
| [x] | T-006.8 | Encrypt stored files | Cryptography | 2h | Added AES-GCM encryption before writing uploaded files |

## US-007 - Medical File Validation

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-007.1 | Implement DICOM reading with pydicom | pydicom | 3h | Added `pydicom` validation service |
| [x] | T-007.2 | Verify DICOM structure | pydicom | 2h | Checks `DICM` preamble marker before parsing |
| [x] | T-007.3 | Validate required metadata | Python | 2h | Validates `Modality` and `PatientID` presence |
| [x] | T-007.4 | Detect corrupted files | Python | 2h | Rejects corrupted/incomplete DICOM payloads with controlled `422` responses |
| [x] | T-007.5 | Create user-facing validation messages | Frontend | 2h | Existing dashboard displays backend validation detail to the user |
| [x] | T-007.6 | Log validation failures | Logging | 1h | Added `validation_failed` audit logs without patient values |
| [x] | T-007.7 | Add validation unit tests | pytest | 2h | Added tests for valid DICOM, missing marker, missing metadata, corrupted DICOM, and safe audit logging |

## US-008 - Automatic DICOM Anonymization (RGPD)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-008.1 | Identify sensitive DICOM tags | pydicom | 3h | Added DICOM sensitive keyword list and private tag removal |
| [x] | T-008.2 | Implement anonymization function | Python | 5h | Replaces `PatientID`, masks `PatientName`, removes sensitive metadata, and preserves technical metadata |
| [x] | T-008.3 | Create patient mapping table | SQLAlchemy | 3h | Added `PatientIdentityMap` model and migration |
| [x] | T-008.4 | Encrypt patient mapping table values | Cryptography | 3h | Original patient IDs are encrypted before database storage |
| [x] | T-008.5 | Create admin re-identification endpoint if needed | FastAPI | 3h | Added admin-only `/patient-identities/{anonymous_patient_id}` with audit trail |
| [x] | T-008.6 | Log anonymization actions | Logging/AuditLog | 2h | Added `dicom_anonymized` and `patient_reidentified` audit events without patient values |
| [~] | T-008.7 | Test anonymization on public dataset samples | Test | 4h | Automated tests use generated public-safe DICOM samples; public dataset validation remains manual |
| [x] | T-008.8 | Write RGPD compliance documentation | Markdown/Report | 3h | Added `app/docs/rgpd_sprint2.md` |
| [x] | T-008.9 | Validate security approach with supervisor | Meeting | 2h | Supervisor validated the RGPD/security approach |

## US-009 - Image Preprocessing (Already Done In Model Workspace)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-009.1 | DICOM to NumPy conversion | pydicom/NumPy | 3h | Model workspace documents image pipeline; app will not duplicate this stage |
| [x] | T-009.2 | Pixel normalization | NumPy | 2h | Model contract uses ImageNet normalization after CLAHE/RGB conversion |
| [x] | T-009.3 | Uniform resizing | OpenCV/PIL | 2h | Model contract uses `224x224` DenseNet-121 input |
| [x] | T-009.4 | Augmentation pipeline | Albumentations | 4h | Model report documents medically plausible augmentations |
| [x] | T-009.5 | Augmentation parameters | Config | 2h | Model report documents rotation, crop, affine, flip, brightness, and contrast settings |
| [x] | T-009.6 | Pipeline sample tests | Test | 3h | Model evaluation artifacts and generated figures verify the completed pipeline |
| [x] | T-009.7 | Batch performance optimization | NumPy | 3h | Deployment docs record ONNX export and runtime optimization for inference |
| [x] | T-009.8 | Preprocessing documentation | Report | 3h | Evidence summarized in `app/docs/us009_model_evidence.md`; source remains in `model/` |

## US-010 - Upload Error Handling

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-010.1 | Define upload error catalog | Documentation | 1h | Added `app/docs/upload_errors.md` with 400, 401, 413, 415, 422, and 500 cases |
| [x] | T-010.2 | Create user-facing error messages | Frontend | 2h | Dashboard upload client displays structured message and recovery suggestion |
| [x] | T-010.3 | Implement appropriate HTTP status codes | FastAPI | 2h | Upload errors now return consistent structured details with proper HTTP status codes |
| [x] | T-010.4 | Log server errors safely | Logging | 2h | Audit metadata logs stable error codes and content type, without patient IDs or filenames |
| [x] | T-010.5 | Test upload error scenarios | pytest | 3h | Covered missing file, auth failure, size limit, unsupported type, invalid signatures, invalid DICOM, and storage failure |
| [x] | T-010.6 | Translate messages if needed | i18n | 2h | Error catalog includes centralized EN/FR messages and suggestions |

## US-041 - Public Dataset Collection and Preparation (Already Done In Model Workspace)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-041.1 | Identify relevant datasets | Research | 2h | Kaggle Chest X-Ray Pneumonia selected for Phase 1 binary model; other datasets documented as future expansion |
| [x] | T-041.2 | Prepare dataset download scripts | Python/Wget | 3h | Dataset was already collected in model workflow; no dataset download needed in `app/` |
| [x] | T-041.3 | Organize dataset folder structure | FS | 2h | Model workflow re-split dataset to 80/10/10 stratified train/val/test |
| [x] | T-041.4 | Create integrity verification script | Python | 2h | Model exploration/evaluation artifacts verify usable dataset and pipeline outputs |
| [x] | T-041.5 | Document sources and licenses | Markdown | 2h | Source documented as public Kaggle Chest X-Ray Pneumonia dataset; evidence added in `app/docs/us041_dataset_evidence.md` |
| [x] | T-041.6 | Generate descriptive statistics | Pandas | 3h | Model figures include class distribution, resolution distribution, pixel intensity, and sample image outputs |
| [x] | T-041.7 | Draft dataset report section | Report | 2h | Dataset summary exists in `model/phase1_results/report.md`; app evidence summary added |

## Sprint 2 Risks

| Status | ID | Risk | Impact | Probability | Mitigation |
| --- | --- | --- | --- | --- | --- |
| [ ] | R-005 | DICOM format complexity | High | Medium | Use pydicom and test on representative public-safe samples |
| [x] | R-006 | Dataset download volume | Medium | High | Mitigated: Kaggle dataset already collected in `model/`; app does not download or commit datasets |
| [x] | R-007 | Incomplete anonymization | High | Medium | Mitigated: strict sensitive-tag handling implemented and supervisor validated |
| [~] | R-008 | Slow preprocessing performance | Medium | Low | Preprocessing is already handled in `model/`; backend should avoid duplicating it |
| [ ] | R-009 | Data loss during upload | High | Low | Use checksums, transactional metadata writes, and rollback on storage failure |
| [x] | R-010 | Supervisor validation delays | High | Medium | Mitigated: supervisor validation completed |

## Definition of Done

| Status | Criterion | Verification |
| --- | --- | --- |
| [~] | Code | US-006 backend/frontend implementation is kept in `app/` and does not modify `model/` |
| [x] | Tests | US-006 through US-010 backend tests pass; US-009 and US-041 are evidenced from the completed model workspace |
| [ ] | Review | Code is organized and ready for review |
| [x] | Documentation | Sprint 2 upload, RGPD, model, and dataset evidence docs are updated |
| [x] | Security | Uploaded DICOM files are anonymized and encrypted at rest; supervisor validation completed |
| [~] | Demo | Upload UI builds successfully; local interactive demo still pending |
| [x] | Model sync | US-009 preprocessing contract and US-041 dataset evidence documented from the deployed model workspace |

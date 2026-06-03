# Sprint 5 Checklist - Sécurité & RGPD

Sprint goal: Renforcer la sécurité de la plateforme, garantir la conformité RGPD des données de santé, et implémenter les mécanismes de protection et d'audit.

Scope note: Ce Sprint 5 constitue le volet critique de conformité et de protection des données de santé. Plusieurs tâches liées à la cryptographie au repos et à la journalisation d'audit de base sont déjà partiellement implémentées dans le socle existant et réutilisées.

Status legend:

- `[ ]` To do
- `[x]` Done
- `[~]` Partial
- `[!]` Blocked
- `[-]` Out of scope for this sprint execution

Active sprint capacity: 170h planned.

## US-023 - Chiffrement des données au repos (AES-256)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-023.1 | Sélectionner l'algorithme de chiffrement (AES-256) | Recherche | 2h | Selected and implemented via `AESGCM` (AES-256) in `crypto.py` |
| [x] | T-023.2 | Implémenter le chiffrement des fichiers images | Python/Crypto | 6h | Uploaded images are encrypted prior to filesystem storage in `upload_storage.py` |
| [ ] | T-023.3 | Configurer le chiffrement de la base de données | PostgreSQL | 4h | Database-level TDE/encryption remains to do |
| [ ] | T-023.4 | Mettre en place la gestion des clés (KMS/Vault) | HashiCorp | 5h | Cryptographic keys are currently loaded from environmental variables rather than a KMS |
| [x] | T-023.5 | Implémenter le déchiffrement à la demande | Python | 4h | Decryption of medical images and original patient identities is performed on the fly for authorized users |
| [x] | T-023.6 | Tester la récupération des données chiffrées | Test | 4h | Decryption is covered by automated upload and patient re-identification test suites |
| [ ] | T-023.7 | Documenter le processus (Chapitre 6.2.4) | LaTeX | 3h | Documenting encryption design and procedures remains to do |
| [ ] | T-023.8 | Audit de sécurité du chiffrement | Security | 2h | Security audit of the cryptographic pipeline remains to do |

## US-024 - Chiffrement des données en transit (HTTPS/TLS)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [ ] | T-024.1 | Obtenir un certificat SSL/TLS | Let's Encrypt | 2h | |
| [ ] | T-024.2 | Configurer HTTPS (Nginx) | Nginx | 4h | |
| [ ] | T-024.3 | Redirection HTTP vers HTTPS | Nginx | 2h | |
| [ ] | T-024.4 | Configurer HSTS headers | Nginx | 2h | |
| [ ] | T-024.5 | Désactiver protocoles obsolètes | Nginx | 2h | |
| [ ] | T-024.6 | Tester configuration (SSL Labs) | Online | 2h | |
| [ ] | T-024.7 | Documenter (Chapitre 6.1.3) | LaTeX | 3h | |
| [ ] | T-024.8 | Certificats API internes | mTLS | 3h | |

## US-025 - Gestion des consentements RGPD

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-025.1 | Concevoir formulaire consentement | UX/Design | 3h | Checkbox UI with multi-language (FR/AR) text integrated in registration and dashboard block screen |
| [x] | T-025.2 | Modèle de données Consentement | SQLAlchemy | 2h | Implemented `UserConsent` model and `consent_granted` flag in `User` |
| [x] | T-025.3 | Collecte à l'inscription | Fullstack | 4h | Registration validates and requires consent checkbox to be checked |
| [x] | T-025.4 | Endpoint retrait consentement | FastAPI | 3h | Implemented `/auth/consent/withdraw` to withdraw consent and block access |
| [x] | T-025.5 | Historique des consentements | BDD | 2h | Auditable logs of all consent events stored in `user_consents` table with metadata |
| [x] | T-025.6 | Rédiger textes de consentement | Juridique | 3h | Clear consent texts for health data processing drafted in French and Arabic |
| [x] | T-025.7 | Tester workflow complet | Test | 3h | Covered by pytest in `test_auth.py` and validated end-to-end |
| [ ] | T-025.8 | Documenter (Chapitre 6.3.2) | LaTeX | 2h | |

## US-026 - Droit à l'oubli (suppression des données)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [ ] | T-026.1 | Formulaire demande suppression | Frontend | 3h | |
| [ ] | T-026.2 | Endpoint DELETE /user/:id/data | FastAPI | 4h | |
| [ ] | T-026.3 | Suppression en cascade (BDD) | SQLAlchemy | 4h | |
| [ ] | T-026.4 | Supprimer fichiers images | Storage | 3h | |
| [ ] | T-026.5 | Conserver logs d'audit | Logging | 2h | |
| [ ] | T-026.6 | Confirmation suppression (email) | Email | 2h | |
| [ ] | T-026.7 | Tester suppression complète | Test | 4h | |
| [ ] | T-026.8 | Documenter (Chapitre 6.3.3) | LaTeX | 2h | |

## US-027 - Audit logs de sécurité (Traçabilité)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-027.1 | Modèle AuditLog étendu | SQLAlchemy | 3h | Extensible `AuditLog` model containing actor, action, resources, IP, agent, metadata, and timestamps exists |
| [~] | T-027.2 | Logging tous les endpoints | FastAPI | 5h | Auth (registration, login, logout), uploads, and patient re-identification write audit logs; other endpoints remain to be integrated |
| [x] | T-027.3 | Capturer métadonnées | Python | 3h | IP address and User-Agent are successfully extracted from request headers in `audit.py` |
| [ ] | T-027.4 | Stockage logs immuable | WORM | 4h | |
| [ ] | T-027.5 | Interface consultation logs (admin) | React | 4h | |
| [ ] | T-027.6 | Export des logs (CSV/JSON) | Python | 3h | |
| [ ] | T-027.7 | Tester intégrité des logs | Test | 2h | |
| [ ] | T-027.8 | Documenter (Chapitre 6.2.5) | LaTeX | 2h | |

## US-028 - Tests de pénétration (Pentest) et vulnérabilités

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [ ] | T-028.1 | Configurer scan SAST | SonarQube | 3h | |
| [ ] | T-028.2 | Configurer scan DAST | OWASP ZAP | 4h | |
| [ ] | T-028.3 | Tests intrusion manuels | Manual | 6h | |
| [ ] | T-028.4 | Tester injections SQL | SQLMap | 3h | |
| [ ] | T-028.5 | Tester failles XSS/CSRF | Manual | 3h | |
| [ ] | T-028.6 | Tester authentification/autorisation | Manual | 3h | |
| [ ] | T-028.7 | Générer rapport sécurité | Report | 3h | |
| [ ] | T-028.8 | Corriger vulnérabilités critiques | Dev | 3h | |
| [ ] | T-028.9 | Documenter (Chapitre 6.1.5) | LaTeX | 2h | |

## US-044 - Analyse des menaces (STRIDE)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [ ] | T-044.1 | Étudier méthodologie STRIDE | Recherche | 2h | |
| [ ] | T-044.2 | Diagramme flux de données | Draw.io | 3h | |
| [ ] | T-044.3 | Identifier menaces STRIDE | Analysis | 5h | |
| [ ] | T-044.4 | Évaluer sévérité (DREAD) | Analysis | 3h | |
| [ ] | T-044.5 | Définir contre-mesures | Security | 4h | |
| [ ] | T-044.6 | Matrice des risques | Excel/Doc | 2h | |
| [ ] | T-044.7 | Valider avec encadreur | Réunion | 1h | |

## Sprint 5 Risks

| Status | ID | Risk | Impact | Probability | Mitigation |
| --- | --- | --- | --- | --- | --- |
| [x] | R-026 | Complexité du chiffrement AES-256 | High | Medium | Mitigated: Standard cryptography/AEAD AESGCM is already integrated in `crypto.py` |
| [ ] | R-027 | Perte des clés de chiffrement | Critical | Low | Backup/KMS storage for credentials remains to design |
| [ ] | R-028 | Non-conformité RGPD détectée tardivement | High | Medium | Perform continuous audits and validation of consent/deletion controls |
| [ ] | R-029 | Vulnérabilités critiques non corrigeables | High | Low | Refactoring/mitigations as security findings arise |
| [ ] | R-030 | Performance impactée par le chiffrement | Medium | Medium | Optimize file reads/writes, evaluate impact on server response latency |
| [ ] | R-031 | Logs trop volumineux (stockage) | Medium | Medium | Log rotation policies and database table indexes |
| [ ] | R-032 | Délais de validation encadreur | Medium | Medium | Maintain regular checkpoints at day 5 and 10 |
| [ ] | R-033 | Complexité juridique RGPD | High | Medium | Consult standard templates and CNIL guidelines |

## Definition of Done (Sprint 5)

| Status | Criterion | Verification |
| --- | --- | --- |
| [~] | Code | Partial: AES-256 at rest encryption for file uploads and client identity mapping, base extended AuditLog models exist |
| [ ] | Tests | Security SAST/DAST/Pentest tools executed and validated |
| [ ] | Review | Peer/mentor code reviews completed |
| [ ] | Documentation | Centralized security logs, TLS, GDPR, threat mitigation and Chapter 6 written |
| [~] | Sécurité | Cryptographic algorithms implemented, threat review and penetrations pending |
| [ ] | RGPD | User consent records and right to be forgotten fully validated |
| [ ] | Démo | End-to-end security audit logs, consent flow, and data removal demonstrated |
| [ ] | Mémoire | Chapter 6 of the academic report completed and validated |

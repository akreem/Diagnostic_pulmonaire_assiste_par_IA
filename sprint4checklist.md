# Sprint 4 Checklist - Interface & Integration

Sprint goal: deliver the user-facing analysis experience: dashboard, result visualization, analysis history, PDF reports, responsive layout, notifications, and end-to-end frontend/API/model integration.

Scope note: Sprint 4 connects the `app/` frontend and backend with the model inference outputs from previous sprints. Tasks involving model prediction, confidence, and heatmaps should reuse the existing model/API contract instead of retraining or changing the model pipeline.

Status legend:

- `[ ]` To do
- `[x]` Done
- `[~]` Partial
- `[!]` Blocked
- `[-]` Out of scope for this sprint execution

Active sprint capacity: 154h planned.

Checklist updated from current code review: backend/frontend implementation already covers the clinical dashboard shell, upload-to-AI analysis flow, Grad-CAM retrieval, responsive layout CSS, and frontend/API configuration. Dedicated Sprint 4 endpoints for dashboard stats, results detail, history, reports, and notifications are still pending unless noted as partial.

## US-017 - Dashboard

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [ ] | T-017.1 | Concevoir maquette dashboard | Figma | 3h | No Figma artifact found in repo |
| [x] | T-017.2 | Créer composant Dashboard | React | 4h | `DashboardPage` implements clinical dashboard shell, navigation, KPIs, intake, results, patients, and admin panels |
| [x] | T-017.3 | Endpoint GET `/dashboard/stats` | FastAPI | 3h | Added authenticated dashboard stats endpoint with KPIs, severity/status breakdowns, and recent analyses |
| [x] | T-017.4 | Implémenter graphiques | Chart.js | 4h | Added Chart.js dependency and dashboard doughnut/bar charts fed by `/dashboard/stats` |
| [x] | T-017.5 | Liste analyses récentes | React | 3h | Dashboard recent analyses list now uses persisted `recent_analyses` from `/dashboard/stats` |
| [x] | T-017.6 | Optimiser chargement avec cache | Redis | 2h | Added Redis-backed `/dashboard/stats` cache with per-user keys, TTL, upload invalidation, Docker Redis service, and tests |
| [~] | T-017.7 | Tester responsive design | Test | 1h | Responsive CSS exists; automated/device test evidence not found |

## US-018 - Résultats d'Analyse

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [ ] | T-018.1 | Concevoir page résultats | Figma | 3h | No Figma artifact found in repo |
| [x] | T-018.2 | Composant ImageViewer avec zoom | React | 5h | `ScanViewer` supports zoom, drag/pan, brightness, contrast, reset, and measurement overlay |
| [x] | T-018.3 | Superposition heatmap/image | Canvas | 4h | Added authenticated source image endpoint and canvas overlay rendering image + Grad-CAM heatmap |
| [x] | T-018.4 | Endpoint GET `/results/:id` | FastAPI | 3h | Added authenticated `GET /results/{id}` endpoint with owner scoping and result detail response |
| [x] | T-018.5 | Afficher diagnostic et confiance | React | 3h | Result cards display prediction, confidence, status, latency, and AI errors |
| [x] | T-018.6 | Indicateur de sévérité | CSS/JS | 2h | `SeverityBadge` and severity rules implemented |
| [x] | T-018.7 | Bouton export image annotée | JS | 3h | Added PNG export button that downloads the current canvas overlay as an annotated image |
| [x] | T-018.8 | Optimiser rendu images | React | 3h | Added lazy viewport loading, memoized heavy result viewers, object URL cleanup, and CSS content visibility for result cards |
| [ ] | T-018.9 | Tests interface et performance | Test | 2h | Planned |

## US-019 - Historique des Analyses

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-019.1 | Modèle AnalysisHistory | SQLAlchemy | 2h | Added separate `AnalysisHistory` SQLAlchemy model for persisted result history metadata |
| [x] | T-019.2 | Migration BDD | Alembic | 1h | Added Alembic migration creating `analysis_history` table, enum, indexes, and foreign keys |
| [x] | T-019.3 | Endpoint GET `/history` avec filtres | FastAPI | 4h | Added authenticated history endpoint with status, prediction, severity, ambiguous, search, and date filters |
| [x] | T-019.4 | Pagination serveur | FastAPI | 2h | `/history` now returns paginated server-side results with total, page, page size, and total pages |
| [x] | T-019.5 | Composant frontend liste | React | 4h | Added persisted history table backed by `/history` instead of session-only analysis rows |
| [x] | T-019.6 | Filtres et recherche | React | 4h | Added search, status, prediction, severity, ambiguous filters, and pagination controls |
| [x] | T-019.7 | Export CSV | Python/JS | 2h | Added `/history/export.csv` backend export and frontend CSV download button |
| [ ] | T-019.8 | Tests performances grand volume | Test | 2h | Planned |
| [ ] | T-019.9 | Documenter Chapitre 4.2.3 | LaTeX | 1h | Planned |

## US-020 - Rapport PDF

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-020.1 | Sélectionner librairie PDF | Recherche | 2h | Selected lightweight standard-library PDF renderer to avoid native/system dependencies in Docker |
| [x] | T-020.2 | Concevoir template rapport | HTML/CSS | 4h | Added reusable report HTML/CSS template constants and matching PDF layout content |
| [x] | T-020.3 | Endpoint GET `/report/:id/pdf` | FastAPI | 4h | Added authenticated `GET /report/{id}/pdf` endpoint with owner scoping and PDF download response |
| [x] | T-020.4 | Intégrer image et heatmap PDF | Python | 4h | PDF renderer embeds source image and Grad-CAM heatmap XObjects when encrypted assets are available |
| [x] | T-020.5 | En-tête et pied de page | Python | 2h | Added report header, separator lines, disclaimer block, footer, and page marker |
| [x] | T-020.6 | Disclaimer médical obligatoire | Text | 1h | Added mandatory medical validation disclaimer in generated PDF content |
| [x] | T-020.7 | Bouton téléchargement frontend | React | 2h | Added PDF download button on result cards calling `GET /report/{id}/pdf` |
| [ ] | T-020.8 | Tester qualité PDF généré | Test | 3h | Planned |
| [ ] | T-020.9 | Documenter Chapitre 4.2.3 | LaTeX | 2h | Planned |

## US-021 - Responsive Design

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [ ] | T-021.1 | Audit responsive des pages | DevTools | 2h | No audit artifact found |
| [x] | T-021.2 | CSS Grid/Flexbox responsive | CSS | 4h | Responsive grid/flex layouts and breakpoints implemented in `styles.css` |
| [ ] | T-021.3 | Menu hamburger mobile | React/CSS | 3h | Planned |
| [x] | T-021.4 | Adapter tableaux et listes | CSS | 3h | Clinical tables use scroll wrappers, stable min-widths, and responsive layout rules |
| [~] | T-021.5 | Optimiser images mobile | HTML/JS | 2h | Grad-CAM image sizing is responsive; no explicit mobile image loading optimization found |
| [ ] | T-021.6 | Tester différents devices | Test | 2h | Planned |

## US-022 - Notifications

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-022.1 | Modèle Notification | SQLAlchemy | 2h | Added `Notification` SQLAlchemy model with user scope, category, resource metadata, read state, and timestamps |
| [x] | T-022.2 | Migration BDD | Alembic | 1h | Added Alembic migration creating `notifications` table and indexes |
| [x] | T-022.3 | Endpoint GET/POST `/notifications` | FastAPI | 3h | Added authenticated list/create endpoints with unread filtering and admin delivery to another user |
| [x] | T-022.4 | Composant bell icon avec badge | React | 3h | Added bell notification center with unread badge, popover, and notification history list |
| [x] | T-022.5 | Système lecture/non lecture | JS | 2h | Added read/unread endpoints and frontend controls for marking notifications read or unread |
| [x] | T-022.6 | Tester scénarios notification | Test | 2h | Added tests for creation, scoping, admin delivery, read/unread, preferences, and critical upload alerts |
| [ ] | T-022.7 | Documenter Chapitre 4.2.5 | LaTeX | 1h | Planned |

## US-043 - Intégration Frontend/API/IA

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-043.1 | Variables d'environnement | `.env` | 2h | `.env` and `.env.example` include backend, frontend, CORS, storage, and model service settings |
| [x] | T-043.2 | Connecter frontend à API | React | 4h | `services/api.ts` connects auth, users, upload, and Grad-CAM calls to the API |
| [x] | T-043.3 | Configurer CORS et sécurité | FastAPI | 3h | CORS middleware configured from settings; authenticated routes use bearer token dependencies |
| [x] | T-043.4 | Intégrer modèle IA dans flux API | Python | 4h | Upload flow calls model `/predict` and `/gradcam`, stores prediction/confidence/latency/heatmap path |
| [ ] | T-043.5 | Tester flux end-to-end | Test | 6h | Full end-to-end test with frontend, backend, and model service not found; local test commands could not be executed here |
| [x] | T-043.6 | Gestion erreurs globale | Fullstack | 4h | Added React app error boundary/global rejection handler and FastAPI catch-all structured error handler with regression test |
| [x] | T-043.7 | Logs centralisés | Logging | 3h | Added centralized JSON logging config, request logging middleware with request IDs, rotating JSONL file output, and tests |
| [ ] | T-043.8 | Documenter architecture Chapitre 4 | LaTeX | 4h | Planned |

## Sprint 4 Risks

| Status | ID | Risk | Impact | Probability | Mitigation |
| --- | --- | --- | --- | --- | --- |
| [~] | R-011 | Incompatibilité entre frontend, API et contrat modèle | High | Medium | Partially mitigated: upload schema includes prediction, confidence, latency, Grad-CAM, ambiguity, and AI error status |
| [~] | R-012 | Performance lente sur images et heatmaps | Medium | Medium | Partially mitigated with responsive rendering; Redis cache and performance tests remain pending |
| [ ] | R-013 | Génération PDF incomplète ou instable | Medium | Medium | Valider tôt la librairie PDF et tester le rendu avec image, heatmap et disclaimer |
| [~] | R-014 | Complexité responsive sur tableaux et visualisations | Medium | Medium | Partially mitigated through CSS breakpoints and scrollable table wrappers |
| [ ] | R-015 | Couverture de tests insuffisante pour le flux end-to-end | High | Medium | Prioriser les tests API, interface résultats, historique, PDF et workflow complet |

## Definition of Done (Sprint 4)

| Status | Criterion | Verification |
| --- | --- | --- |
| [~] | Dashboard | KPIs and recent/session analyses exist in React; dedicated API stats and Chart.js charts remain pending |
| [~] | Résultats | Diagnostic, confiance, sévérité and Grad-CAM display exist; dedicated result endpoint and true image/heatmap overlay remain pending |
| [~] | Historique | Analyses are persisted in `medical_images`; filters, pagination, history endpoint, and CSV export remain pending |
| [x] | PDF | Rapport PDF generated with image, heatmap, header, footer, disclaimer, and direct frontend download |
| [~] | Responsive | Responsive CSS is implemented; device/browser verification remains pending |
| [x] | Notifications | Les notifications peuvent être créées, listées, marquées lues/non lues, désactivées et affichées avec badge |
| [~] | Integration | Frontend/API/model upload-analysis flow is wired; full end-to-end validation remains pending |
| [ ] | Documentation | Les sections Chapitre 4.2.3, 4.2.5 et architecture Chapitre 4 sont mises à jour |

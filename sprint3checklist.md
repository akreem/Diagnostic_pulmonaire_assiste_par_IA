# Sprint 3 Checklist - Modélisation & Évaluation

Sprint goal: Select, train, evaluate, and deploy the Phase 1 Binary Classification model (Normal vs. Pneumonia), implement Explainable AI (Grad-CAM), and optimize inference performance via ONNX and FastAPI.

Scope note: The model is developed and documented inside the `model/` directory. Tasks relating to frontend (React), database (SQLAlchemy), or notifications (SMTP) remain to be integrated in the `app/` environment.

Status legend:

- `[ ]` To do
- `[x]` Done
- `[~]` Partial
- `[!]` Blocked
- `[-]` Out of scope for this sprint execution

## US-011 - Architecture et API

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-011.1 | Sélectionner architecture CNN | Recherche | 4h | DenseNet-121 selected |
| [x] | T-011.2 | Implémenter architecture modèle | PyTorch | 8h | Implemented DenseNet-121 |
| [x] | T-011.3 | Charger poids pré-entraînés | TorchVision | 3h | ImageNet-1K pretrained weights loaded |
| [x] | T-011.4 | Endpoint API POST /predict | FastAPI | 5h | FastAPI server implemented in `deploy/server.py` |
| [x] | T-011.5 | Intégrer pipeline prétraitement | Python | 4h | CLAHE + normalization pipeline integrated |
| [x] | T-011.6 | Optimiser temps inférence | CUDA/ONNX | 6h | ONNX export implemented |
| [x] | T-011.7 | Tests unitaires inférence | pytest | 5h | Numerical validation of ONNX vs PyTorch output |
| [~] | T-011.8 | Documenter architecture (Chapitre 2) | LaTeX | 5h | Documented in markdown (`report.md`), LaTeX pending |
| [~] | T-011.9 | Versionner modèle (DVC/MLflow) | DVC | 5h | Weights saved manually; MLflow/DVC pending |

## US-012 - Entraînement et Monitorage

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-012.1 | Split datasets (train/val/test) | Python | 3h | 80/10/10 stratified split |
| [x] | T-012.2 | Créer DataLoaders | PyTorch | 4h | Handled class imbalance via WeightedRandomSampler |
| [x] | T-012.3 | Implémenter fonction de perte | PyTorch | 3h | Focal Loss implemented |
| [x] | T-012.4 | Configurer optimiseur/scheduler | PyTorch | 3h | AdamW + CosineAnnealingWarmRestarts |
| [x] | T-012.5 | Implémenter callbacks | PyTorch | 4h | Early stopping implemented |
| [x] | T-012.6 | Lancer entraînement (epochs) | GPU | 10h | Trained successfully |
| [x] | T-012.7 | Monitorer métriques | TensorBoard | 4h | Metrics monitored during training |
| [x] | T-012.8 | Sauvegarder meilleurs poids | File System | 2h | Best weights saved to `densenet121_best.pth` |
| [x] | T-012.9 | Générer courbes apprentissage | Matplotlib | 3h | Curves saved to `figures/` |
| [~] | T-012.10| Documenter processus (Chapitre 8) | LaTeX | 5h | Documented in `report.md`, LaTeX pending |
| [ ] | T-012.11| Versionner expériences (MLflow) | MLflow | 5h | Not implemented |
| [ ] | T-012.12| Backup modèle entraîné | Storage | 4h | Not implemented |

## US-013 - Explainability (XAI)

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-013.1 | Étudier algorithmes XAI | Recherche | 4h | Studied Grad-CAM vs Grad-CAM++ |
| [x] | T-013.2 | Implémenter Grad-CAM | PyTorch | 8h | Implemented successfully |
| [x] | T-013.3 | Superposition heatmap/image | OpenCV | 4h | Done |
| [x] | T-013.4 | Configurer palette couleurs | Matplotlib | 2h | Done |
| [x] | T-013.5 | Endpoint API GET /heatmap | FastAPI | 4h | `POST /gradcam` implemented |
| [x] | T-013.6 | Export PNG avec heatmap | Python | 3h | Exports as base64 string |
| [x] | T-013.7 | Tester cohérence heatmaps | Test | 4h | Tested |
| [~] | T-013.8 | Documenter XAI (Chapitre 2.3.6) | LaTeX | 4h | Documented in `report.md`, LaTeX pending |
| [ ] | T-013.9 | Comparer autres méthodes XAI | Captum | 2h | Not implemented |

## US-014 - Probabilités et Confiance

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-014.1 | Calcul probabilité (softmax) | PyTorch | 2h | Applied via NumPy/PyTorch softmax |
| [x] | T-014.2 | Convertir en pourcentage | Python | 1h | Done |
| [x] | T-014.3 | Définir seuils confiance | Config | 2h | Defined threshold strategies (0.1877, 0.2716, 0.50) |
| [x] | T-014.4 | Intégrer réponse API /predict | FastAPI | 3h | JSON response includes threshold and probabilities |
| [ ] | T-014.5 | Indicateur visuel frontend | React | 3h | App frontend integration not started |
| [x] | T-014.6 | Tester niveaux confiance | Test | 2h | Tested via Threshold Analysis |
| [~] | T-014.7 | Documenter (Chapitre 4.2.3) | LaTeX | 2h | Documented in `deployment_docs.md` |

## US-015 - Gestion des cas ambigus

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [ ] | T-015.1 | Définir seuil confiance critique | Config | 2h | Documented thresholds, but no critical fallback logic |
| [ ] | T-015.2 | Logique détection cas ambigus | Python | 3h | Not implemented |
| [ ] | T-015.3 | Flag dans modèle de données | SQLAlchemy | 2h | Not implemented in `app/` |
| [ ] | T-015.4 | Endpoint GET /ambiguous-cases | FastAPI | 3h | Not implemented |
| [ ] | T-015.5 | Notification email/alerte | SMTP | 3h | Not implemented |
| [ ] | T-015.6 | Interface frontend cas à revoir| React | 4h | Not implemented in `app/` |
| [ ] | T-015.7 | Tester workflow complet | Test | 2h | Not implemented |
| [ ] | T-015.8 | Documenter (Chapitre 4.2.5) | LaTeX | 1h | Not implemented |

## US-016 - Optimisation des performances

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-016.1 | Profiler temps inférence | cProfile | 3h | Done, detailed benchmark in `deployment_docs.md` |
| [x] | T-016.2 | Activer accélération GPU | CUDA | 4h | Done, AMP implemented in PyTorch |
| [x] | T-016.3 | Convertir modèle ONNX | ONNX | 4h | Exported to opset 17 successfully |
| [x] | T-016.4 | Batch inference | PyTorch | 3h | Tested and benchmarked |
| [x] | T-016.5 | Optimiser preprocessing | NumPy | 3h | Done via CLAHE and ONNX Runtime inputs |
| [ ] | T-016.6 | Cache modèles chargés | Redis | 2h | Not implemented |
| [ ] | T-016.7 | Tests de charge performance | Locust | 2h | Not implemented |
| [~] | T-016.8 | Documenter métriques (Chap. 8)| LaTeX | 1h | Documented in markdown |

## US-042 - Évaluation des Résultats

| Status | ID | Task | Tech | Estimate | Notes |
| --- | --- | --- | --- | ---: | --- |
| [x] | T-042.1 | Calcul des métriques | Scikit-learn| 4h | AUC, Accuracy, Precision, Recall calculated |
| [x] | T-042.2 | Matrice de confusion | Seaborn | 3h | Generated in `figures/` |
| [x] | T-042.3 | Precision, Recall, F1-Score | Scikit-learn| 3h | Metrics reported |
| [x] | T-042.4 | Courbe ROC et AUC | Matplotlib | 4h | Generated in `figures/` |
| [x] | T-042.5 | Comparer benchmarks | Recherche | 5h | Compared context in `report.md` |
| [x] | T-042.6 | Export résultats (CSV, PNG) | Python | 2h | JSON and PNG results exported |
| [~] | T-042.7 | Rédiger section 8.2 mémoire | LaTeX | 6h | Report drafted in markdown, LaTeX pending |
| [ ] | T-042.8 | Validation résultats encadreur | Réunion | 3h | Pending |

## Definition of Done (Sprint 3)

| Status | Criterion | Verification |
| --- | --- | --- |
| [x] | Modèle | Architecture CNN fonctionnelle, entraînée et optimisée (ONNX) |
| [x] | XAI | Endpoint Grad-CAM générant des heatmaps pertinents |
| [x] | API | FastAPI déployée pour inférence rapide et explicabilité |
| [x] | Évaluation | Métriques, matrices de confusion et courbes ROC exportées |
| [ ] | Frontend | Indicateur visuel intégré avec l'API `/predict` |
| [ ] | Validation | Validation finale par l'encadreur |

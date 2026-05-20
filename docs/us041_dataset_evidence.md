# US-041 Dataset Collection Evidence

`US-041 - Collecte et preparation des datasets publics` is already covered for the current trained Phase 1 model by the existing `model/` workspace. The dataset work should be documented in `app/`, but the `model/` folder and dataset/model artifacts must not be modified during Sprint 2 backend development.

## Evidence Reviewed

| Source | Evidence |
| --- | --- |
| `model/implementation_plan.md` | Selects public datasets and confirms Phase 1 starts with the Kaggle Chest X-Ray Pneumonia dataset. |
| `model/phase1_results/report.md` | Confirms the Kaggle Chest X-Ray Pneumonia dataset was used, with 5,856 JPEG images and Normal/Pneumonia classes. |
| `model/phase1_results/evaluation_results.json` | Records the trained model dataset as `Kaggle Chest X-Ray Pneumonia`. |
| `model/phase1_results/figures/` | Contains dataset and evaluation figures including class distribution, resolution distribution, sample images, training curves, ROC/PR curves, confusion matrix, and Grad-CAM outputs. |
| `model/deployment_docs.md` | Documents required deployment artifacts including `test_manifest.csv`, `evaluation_results.json`, and trained DenseNet-121 checkpoints. |

## Dataset Summary

| Item | Value |
| --- | --- |
| Dataset | Kaggle Chest X-Ray Pneumonia |
| Source note | Public Kaggle dataset, Paul Mooney |
| Total images | 5,856 |
| Classes | NORMAL, PNEUMONIA |
| Format | JPEG |
| Split | Re-split to 80/10/10 stratified for Phase 1 |
| Current model | DenseNet-121 binary classifier |

## Sprint 2 Decision

For this Sprint 2 application work:

- do not download or commit datasets in `app/`;
- do not modify the existing `model/` folder;
- document the completed dataset work as evidence;
- treat COVID-19, TB, NIH, and CheXpert expansion as future model-scope work, not required for the already deployed binary model.

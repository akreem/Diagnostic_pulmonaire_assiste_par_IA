# US-009 Model Workspace Evidence

`US-009 - Pretraitement des images (normalisation & augmentation)` is already covered by the existing `model/` workspace. The application backend/frontend should integrate with these model expectations, but must not modify files under `model/`.

## Evidence Reviewed

| Source | Evidence |
| --- | --- |
| `model/implementation_plan.md` | Defines the DenseNet-121 model plan, preprocessing pipeline, augmentation strategy, training configuration, and verification approach. |
| `model/phase1_results/report.md` | Confirms Phase 1 binary classification was completed on Kaggle Chest X-Ray Pneumonia with DenseNet-121. |
| `model/phase1_results/evaluation_results.json` | Records model metrics, threshold strategies, hyperparameters, and preprocessing contract. |
| `model/deployment_docs.md` | Documents inference deployment, ONNX export, FastAPI model service endpoints, and shared preprocessing for `/predict` and `/gradcam`. |

## Preprocessing Contract

The completed model pipeline expects:

- chest X-ray image input;
- CLAHE preprocessing;
- resize to `224x224`;
- RGB/3-channel representation;
- ImageNet normalization;
- DenseNet-121 input shape compatible with `1 x 3 x 224 x 224`.

## Training And Evaluation Summary

| Item | Result |
| --- | --- |
| Model | DenseNet-121 |
| Task | Binary classification: Normal vs Pneumonia |
| Dataset | Kaggle Chest X-Ray Pneumonia |
| Test size | 524 |
| AUC-ROC | 0.9980 |
| Screening threshold | 0.2715606391429901 |
| Screening sensitivity | 0.9769 |
| Screening specificity | 0.9778 |
| Default threshold sensitivity | 0.9332 |
| Default threshold specificity | 0.9926 |

## Sprint 2 Decision

For Sprint 2 app development:

- do not reimplement preprocessing, augmentation, training, or model export in `app/`;
- do not edit the `model/` folder;
- keep backend upload/validation/anonymization compatible with later model-service integration;
- use the documented model preprocessing contract when Sprint 3/4 integration starts.

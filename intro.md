**Product Backlog - Plateforme d'Aide au Diagnostic Pulmonaire par IA**

**1\. Structure du Product Backlog**

| **Champ**                  | **Description**                                         |
| -------------------------- | ------------------------------------------------------- |
| **ID**                     | Identifiant unique de la User Story (US)                |
| **Titre**                  | Nom court et descriptif de la fonctionnalité            |
| **Description**            | Format : "En tant que... Je veux... Afin de..."         |
| **Priorité**               | MoSCoW (Must have, Should have, Could have, Won't have) |
| **Story Points**           | Effort estimé (1-13 selon la suite de Fibonacci)        |
| **Sprint**                 | Sprint assigné selon la planification du projet         |
| **Critères d'Acceptation** | Conditions de validation (Definition of Done)           |

**2\. Product Backlog Détaillé**

**ÉPIC<sup>[\[1\]](#footnote-1)</sup> 1 : Gestion des Utilisateurs et Authentification (Sprint 1 & 5)**

| **ID**     | **Titre**                                      | **Priorité** | **Story Point** | **Sprint** | **Critères d'Acceptation**                                                                                            |
| ---------- | ---------------------------------------------- | ------------ | --------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| **US-001** | Inscription des utilisateurs                   | Must         | 3               | S1         | Formulaire d'inscription fonctionnel avec validation email                                                            |
| **US-002** | Connexion sécurisée                            | Must         | 5               | S1         | Authentification avec **JWT<sup>[\[2\]](#footnote-2)</sup>**, mot de passe hashé (bcrypt : Générateur de hash online) |
| **US-003** | Gestion des rôles (Médecin/Admin/Technicien,…) | Must         | 5               | S5         | **RBAC<sup>[\[3\]](#footnote-3)</sup>** implémenté, accès différenciés selon le profil                                |
| **US-004** | Réinitialisation de mot de passe               | Should       | 3               | S5         | Flow de récupération par email sécurisé                                                                               |
| **US-005** | Journalisation des connexions                  | Must         | 2               | S5         | Logs d'audit stockés pour traçabilité (RGPD)                                                                          |

**ÉPIC 2 : Import et Prétraitement des Images Médicales (Sprint 2)**

| **ID**     | **Titre**                                | **Priorité** | **Story Point** | **Sprint** | **Critères d'Acceptation**                                                                    |
| ---------- | ---------------------------------------- | ------------ | --------------- | ---------- | --------------------------------------------------------------------------------------------- |
| **US-006** | Upload d'images (DICOM, PNG, JPG)        | Must         | 5               | S2         | Support multi-formats, limite de taille (ex: 50MB)                                            |
| **US-007** | Validation des fichiers médicaux         | Must         | 3               | S2         | Vérification de l'intégrité du fichier DICOM (Digital Imaging and Communications in Medicine) |
| **US-008** | Anonymisation automatique des DICOM      | Must         | 8               | S2         | Suppression des métadonnées identifiantes (nom, date de naissance, n°CIN, n°CNAM)             |
| **US-009** | Prétraitement des images (normalisation) | Must         | 5               | S2         | Redimensionnement, normalisation des pixels, augmentation                                     |
| **US-010** | Gestion des erreurs d'upload             | Should       | 3               | S2         | Messages d'erreur clairs pour l'utilisateur                                                   |

**ÉPIC 3 : Modèle IA et Analyse Automatisée (Sprint 3)**

| **ID**     | **Titre**                                                                                               | **Priorité** | **Story Point** | **Sprint** | **Critères d'Acceptation**                                  |
| ---------- | ------------------------------------------------------------------------------------------------------- | ------------ | --------------- | ---------- | ----------------------------------------------------------- |
| **US-011** | Intégration du modèle de classification                                                                 | Must         | 13              | S3         | Modèle chargé, inférence fonctionnelle via API              |
| **US-012** | Détection de pathologies pulmonaires                                                                    | Must         | 13              | S3         | Classification (Normal/Pneumonie/Tuberculose/etc.)          |
| **US-013** | Génération de **Heatmaps<sup>[\[4\]](#footnote-4)</sup>** **(Grad-CAM)<sup>[\[5\]](#footnote-5)</sup>** | Must         | 8               | S3         | Visualisation des zones d'intérêt sur l'image               |
| **US-014** | Score de confiance du diagnostic                                                                        | Must         | 3               | S3         | Affichage du pourcentage de confiance du modèle             |
| **US-015** | Gestion des cas ambigus                                                                                 | Should       | 5               | S3         | Signalisation des cas à faible confiance pour revue humaine |
| **US-016** | Optimisation des performances d'inférence                                                               | Should       | 5               | S3         | Temps de réponse < 5 secondes par image                     |

**ÉPIC 4 : Interface Utilisateur et Visualisation (Sprint 4)**

| **ID**     | **Titre**                             | **Priorité** | **Story Point** | **Sprint** | **Critères d'Acceptation**                         |
| ---------- | ------------------------------------- | ------------ | --------------- | ---------- | -------------------------------------------------- |
| **US-017** | Dashboard principal                   | Must         | 5               | S4         | Vue d'ensemble des analyses récentes               |
| **US-018** | Visualisation des résultats d'analyse | Must         | 8               | S4         | Affichage image + heatmap + diagnostic + confiance |
| **US-019** | Historique des analyses               | Must         | 5               | S4         | Liste chronologique avec recherche et filtres      |
| **US-020** | Génération de rapport PDF             | Should       | 5               | S4         | Export des résultats avec heatmap et métadonnées   |
| **US-021** | Interface responsive (Desktop/Mobile) | Should       | 3               | S4         | Adaptation à différents écrans                     |
| **US-022** | Thème sombre/clair                    | Could        | 2               | S4         | Préférence utilisateur pour le confort visuel      |

**ÉPIC 5 : Sécurité et Conformité RGPD (Sprint 5)**

| **ID**     | **Titre**                                 | **Priorité** | **Story Point** | **Sprint** | **Critères d'Acceptation**                                                    |
| ---------- | ----------------------------------------- | ------------ | --------------- | ---------- | ----------------------------------------------------------------------------- |
| **US-023** | Chiffrement des données au repos          | Must         | 8               | S5         | **AES-256<sup>[\[6\]](#footnote-6)</sup>** pour le stockage des images et BDD |
| **US-024** | Chiffrement des données en transit        | Must         | 5               | S5         | HTTPS/TLS obligatoire pour toutes les communications                          |
| **US-025** | Gestion des consentements                 | Must         | 5               | S5         | Checkbox RGPD lors de l'inscription et upload                                 |
| **US-026** | Droit à l'oubli (suppression des données) | Must         | 5               | S5         | Fonctionnalité de suppression complète des données utilisateur                |
| **US-027** | Audit logs de sécurité                    | Must         | 5               | S5         | Traçabilité de toutes les actions sensibles                                   |
| **US-028** | Tests de pénétration (Pentest)            | Should       | 8               | S5         | Rapport de sécurité avec corrections des vulnérabilités                       |

**ÉPIC 6 : DevOps et Déploiement (Sprint 6)**

| **ID**     | **Titre**                       | **Priorité** | **SP** | **Sprint** | **Critères d'Acceptation**                                                                                          |
| ---------- | ------------------------------- | ------------ | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **US-029** | Conteneurisation Docker         | Must         | 5      | S6         | Dockerfile pour Backend, Frontend, IA                                                                               |
| **US-030** | Pipeline CI/CD (GitHub Actions) | Must         | 8      | S6         | Build et test automatiques à chaque **commit<sup>[\[7\]](#footnote-7)</sup>**                                       |
| **US-031** | Déploiement automatisé          | Must         | 5      | S6         | Déploiement en environnement de test et production                                                                  |
| **US-032** | Monitoring (Prometheus/Grafana) | Should       | 5      | S6         | Dashboard de santé de l'application (CPU, RAM, latence)                                                             |
| **US-033** | Gestion des logs centralisés    | Should       | 3      | S6         | Agrégation des logs (**ELK**<sup>[\[8\]](#footnote-8)</sup> **Stack<sup>[\[9\]](#footnote-9)</sup>** ou équivalent) |
| **US-034** | Plan de rollback                | Should       | 3      | S6         | Procédure de retour à la version précédente en cas d'échec                                                          |

**ÉPIC 7 : Tests et Validation (Sprint 6)**

| **ID**     | **Titre**                           | **Priorité** | **Story Point** | **Sprint** | **Critères d'Acceptation**                                 |
| ---------- | ----------------------------------- | ------------ | --------------- | ---------- | ---------------------------------------------------------- |
| **US-035** | Tests unitaires Backend             | Must         | 5               | S6         | Couverture de code > 80%                                   |
| **US-036** | Tests d'intégration API             | Must         | 5               | S6         | Tous les _endpoints_ testés et fonctionnels                |
| **US-037** | Tests de performance (Load Testing) | Should       | 5               | S6         | Simulation de 100 utilisateurs simultanés                  |
| **US-038** | Tests utilisateurs (UX)             | Should       | 5               | S6         | Feedback de 5 utilisateurs testeurs collecté               |
| **US-039** | Validation scientifique du modèle   | Must         | 8               | S6         | Métriques (Accuracy, Sensibilité, Spécificité) documentées |
| **US-040** | Documentation technique             | Must         | 5               | S6         | README, API Docs (Swagger), Guide de déploiement           |

**3\. Matrice de Priorisation (MoSCoW)**

| **Priorité**    | **Description**                                                   | **% du Backlog** | **Sprint Critique** |
| --------------- | ----------------------------------------------------------------- | ---------------- | ------------------- |
| **Must Have**   | Fonctionnalités indispensables **(Minimum Viable Product (MVP))** | 60%              | S1, S2, S3, S5, S6  |
| **Should Have** | Important mais pas bloquant                                       | 30%              | S4, S5, S6          |
| **Could Have**  | Confort / Bonus                                                   | 10%              | S4, S6              |
| **Won't Have**  | Hors périmètre pour ce Projet de Fin d'Études                     | 0%               | \-                  |

**4\. Definition of Done (DoD)**

Pour qu'une User Story soit considérée comme **terminée**, les critères suivants doivent être respectés :

| **Critère**       | **Description**                                                                       |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Code**          | Code développé, reviewé et mergé sur la branche principale                            |
| **Tests**         | Tests unitaires et d'intégration passants                                             |
| **Documentation** | Code commenté, documentation API mise à jour                                          |
| **Sécurité**      | Pas de vulnérabilités critiques **(scan SAST/DAST)<sup>[\[10\]](#footnote-10)</sup>** |
| **RGPD**          | Conformité vérifiée pour les données de santé                                         |
| **Démo**          | Fonctionnalité démontrable sur l'environnement de test                                |
| **Validation**    | Validée par le Product Owner (l'étudiant) et l'encadreur                              |

**5\. Velocity<sup>[\[11\]](#footnote-11)</sup> Planning (Estimation sur 6 Sprints)**

| **Sprint**   | **Durée**       | **Capacity (SP)** | **User Stories Ciblées**        | **Objectif Principal**                                                    |
| ------------ | --------------- | ----------------- | ------------------------------- | ------------------------------------------------------------------------- |
| **Sprint 1** | 2 semaines      | 20 SP             | US-001, US-002, US-005          | Authentification & Cadrage                                                |
| **Sprint 2** | 2 semaines      | 25 SP             | US-006 à US-010                 | Data Engineering & DICOM (Digital Imaging and Communications in Medicine) |
| **Sprint 3** | 2 semaines      | 35 SP             | US-011 à US-016                 | Modèle IA & **XAI<sup>[\[12\]](#footnote-12)</sup>**                      |
| **Sprint 4** | 2 semaines      | 25 SP             | US-017 à US-022                 | Frontend & Dashboard                                                      |
| **Sprint 5** | 2 semaines      | 30 SP             | US-003, US-004, US-023 à US-028 | Sécurité & RGPD                                                           |
| **Sprint 6** | 2 semaines      | 35 SP             | US-029 à US-040                 | DevOps, Tests & Déploiement                                               |
| **TOTAL**    | **12 semaines** | **170 SP**        | **40 User Stories**             | **Plateforme Complète**                                                   |

**6\. Risques et Mitigation (Liés au Backlog)**

| **Risque**                   | **Impact** | **Probabilité** | **Mitigation**                                                |
| ---------------------------- | ---------- | --------------- | ------------------------------------------------------------- |
| **Données insuffisantes**    | Élevé      | Moyenne         | Utiliser des datasets publics (NIH, CheXpert, Kaggle)         |
| **Performance IA faible**    | Élevé      | Moyenne         | Transfer Learning, Data Augmentation, Tuning                  |
| **Complexité RGPD**          | Moyen      | Élevée          | Anonymisation systématique, Privacy by Design dès le Sprint 1 |
| **Délais serrés**            | Élevé      | Élevée          | Prioriser les "Must Have", reporter les "Could Have"          |
| **Problèmes de déploiement** | Moyen      | Moyenne         | Dockerisation précoce, tests CI/CD dès le Sprint 3            |

# Sprint 1 Backlog - "Analyse & Cadrage"

Ce Sprint 1 pose les fondations techniques et méthodologiques du projet.

## 1\. Informations du Sprint

| **Information**                      | **Détail**                                                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Nom du Sprint**                    | Sprint 1 - Analyse & Cadrage                                                                                                      |
| **Durée**                            | 2 semaines                                                                                                                        |
| **Date de début**                    | &nbsp;17/02/2026                                                                                                                  |
| **Date de fin**                      | &nbsp;01/03/2026                                                                                                                  |
| **Objectif du Sprint (Sprint Goal)** | Mettre en place l'environnement de développement, valider les exigences fonctionnelles, et implémenter l'authentification de base |
| **Capacity Totale**                  | 170 heures (équivalent 20 Story Points)                                                                                           |

## 2\. User Stories Détaillées du Sprint 1

### US-001 : Initialisation de l'environnement de développement

| **Champ**            | **Description**                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Initialisation de l'environnement de développement                                                                                                         |
| **Description**      | En tant que **Développeur**, je veux **configurer l'environnement de développement** afin de **pouvoir commencer le codage dans des conditions optimales** |
| **Priorité**         | Must Have                                                                                                                                                  |
| **Story Points**     | 3                                                                                                                                                          |
| **Estimation Temps** | 16 heures                                                                                                                                                  |
| **Dépendances**      | Aucune                                                                                                                                                     |

#### **Critères d'Acceptation**

- Dépôt Git initialisé avec structure de dossiers standard
- Environnements virtuels Python configurés (venv/conda)
- Docker installé et fonctionnel sur la machine de developpement
- README.md créé avec instructions d'installation
- **.gitignore** configuré pour Python, IDE, et données sensibles

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                               | **Techno**  | **Estimation** | **Statut** |
| ------------ | ------------------------------------------------------------- | ----------- | -------------- | ---------- |
| **T-001.1**  | Créer la structure de dossiers du projet                      | File System | 2h             | ☐          |
| **T-001.2**  | Initialiser le dépôt Git et branches (main, dev, feature/\*)  | Git         | 1h             | ☐          |
| **T-001.3**  | Configurer les environnements virtuels Python                 | venv/conda  | 2h             | ☐          |
| **T-001.4**  | Créer les Dockerfile de base (Backend, Frontend, IA)          | Docker      | 4h             | ☐          |
| **T-001.5**  | Rédiger le README.md (installation, usage)                    | Markdown    | 3h             | ☐          |
| **T-001.6**  | Configurer **.gitignore** et **.env.example**                 | Git         | 1h             | ☐          |
| **T-001.7**  | Tester la cohérence de l'environnement sur une machine vierge | Test        | 3h             | ☐          |

### US-002 : Inscription des utilisateurs

| **Champ**            | **Description**                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Inscription des utilisateurs                                                                                                 |
| **Description**      | En tant que **futur utilisateur (médecin)**, je veux **pouvoir créer un compte** afin de **pouvoir accéder à la plateforme** |
| **Priorité**         | Must Have                                                                                                                    |
| **Story Points**     | 5                                                                                                                            |
| **Estimation Temps** | 20 heures                                                                                                                    |
| **Dépendances**      | US-001 (Environnement)                                                                                                       |

#### **Critères d'Acceptation**

- Formulaire d'inscription fonctionnel (frontend)
- Validation des champs (email, mot de passe fort)
- Hachage des mots de passe (bcrypt/argon2)
- Stockage sécurisé en base de données
- Email de confirmation envoyé (mock ou réel)
- Tests unitaires pour l'endpoint d'inscription

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                                                           | **Techno**      | **Estimation** | **Statut** |
| ------------ | ----------------------------------------------------------------------------------------- | --------------- | -------------- | ---------- |
| **T-002.1**  | Concevoir le modèle de données User **(SQLAlchemy)<sup>[\[13\]](#footnote-13)</sup>**     | Python/SQL      | 2h             | ☐          |
| **T-002.2**  | Créer la migration de base de données                                                     | Alembic         | 1h             | ☐          |
| **T-002.3**  | Développer l'endpoint API POST /register                                                  | FastAPI         | 4h             | ☐          |
| **T-002.4**  | Implémenter le hachage de mot de passe                                                    | bcrypt          | 2h             | ☐          |
| **T-002.5**  | Créer le formulaire frontend d'inscription                                                | React/Streamlit | 4h             | ☐          |
| **T-002.6**  | Valider les inputs (**regex email<sup>[\[14\]](#footnote-14)</sup>**, force mot de passe) | Frontend        | 2h             | ☐          |
| **T-002.7**  | Configurer le service d'envoi d'email (SMTP ou mock)                                      | SMTP            | 2h             | ☐          |
| **T-002.8**  | Écrire les tests unitaires (pytest)                                                       | pytest          | 3h             | ☐          |

### US-003 : Connexion sécurisée (Authentication)

| **Champ**            | **Description**                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Connexion sécurisée                                                                                                 |
| **Description**      | En tant que **utilisateur enregistré**, je veux **pouvoir me connecter** afin de **pouvoir accéder à mes analyses** |
| **Priorité**         | Must Have                                                                                                           |
| **Story Points**     | 5                                                                                                                   |
| **Estimation Temps** | 20 heures                                                                                                           |
| **Dépendances**      | US-002 (Inscription)                                                                                                |

#### **Critères d'Acceptation**

- Formulaire de connexion fonctionnel
- Génération de token JWT après authentification réussie
- Token stocké côté client (localStorage/cookie httpOnly)
- Gestion des erreurs (mauvais mot de passe, utilisateur inexistant)
- Déconnexion fonctionnelle (invalidation du token)
- Tests de sécurité (brute force protection)

**Tâches Techniques Associées**

| **ID Tâche** | **Description**                                          | **Techno**       | **Estimation** | **Statut** |
| ------------ | -------------------------------------------------------- | ---------------- | -------------- | ---------- |
| **T-003.1**  | Créer l'endpoint API POST /login                         | FastAPI          | 3h             | ☐          |
| **T-003.2**  | Implémenter la génération de JWT                         | PyJWT            | 3h             | ☐          |
| **T-003.3**  | Créer le middleware d'authentification                   | FastAPI          | 3h             | ☐          |
| **T-003.4**  | Développer le formulaire frontend de connexion           | React/Streamlit  | 4h             | ☐          |
| **T-003.5**  | Gérer le stockage du token côté client                   | JS               | 2h             | ☐          |
| **T-003.6**  | Implémenter la fonction de déconnexion                   | Frontend/Backend | 2h             | ☐          |
| **T-003.7**  | Ajouter la protection contre brute force (rate limiting) | Redis/Slowapi    | 2h             | ☐          |
| **T-003.8**  | Écrire les tests d'intégration authentication            | pytest           | 1h             | ☐          |

### US-004 : Journalisation des connexions (Audit Logs)

| **Champ**            | **Description**                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Journalisation des connexions                                                                                                     |
| **Description**      | En tant que **Administrateur Sécurité**, je veux **pouvoir tracer les connexions** afin de **détecter les accès suspects (RGPD)** |
| **Priorité**         | Must Have                                                                                                                         |
| **Story Points**     | 3                                                                                                                                 |
| **Estimation Temps** | 12 heures                                                                                                                         |
| **Dépendances**      | US-003 (Connexion)                                                                                                                |

#### **Critères d'Acceptation**

- Chaque connexion/déconnexion est loguée en base de données
- Les logs contiennent : timestamp, IP, user_id, statut (succès/échec)
- Les logs sont protégés en écriture (immuables)
- Endpoint admin pour consulter les logs
- Conformité RGPD (durée de conservation définie)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                                              | **Techno**     | **Estimation** | **Statut** |
| ------------ | ---------------------------------------------------------------------------- | -------------- | -------------- | ---------- |
| **T-004.1**  | Concevoir le modèle de données **AuditLog<sup>[\[15\]](#footnote-15)</sup>** | SQLAlchemy     | 2h             | ☐          |
| **T-004.2**  | Créer la migration de base de données                                        | Alembic        | 1h             | ☐          |
| **T-004.3**  | Implémenter le logger dans les endpoints auth                                | Python logging | 3h             | ☐          |
| **T-004.4**  | Capturer l'adresse IP du client                                              | FastAPI        | 1h             | ☐          |
| **T-004.5**  | Créer l'endpoint admin GET /logs                                             | FastAPI        | 2h             | ☐          |
| **T-004.6**  | Définir la politique de rétention des logs (ex: 1 an)                        | Config         | 1h             | ☐          |
| **T-004.7**  | Écrire les tests pour la journalisation                                      | pytest         | 2h             | ☐          |

### US-005 : Documentation des spécifications fonctionnelles

| **Champ**            | **Description**                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Documentation des spécifications fonctionnelles                                                                                       |
| **Description**      | En tant que **Chef de Projet**, je veux **documenter les spécifications** afin de **figer le périmètre pour le mémoire (Chapitre 3)** |
| **Priorité**         | Must Have                                                                                                                             |
| **Story Points**     | 2                                                                                                                                     |
| **Estimation Temps** | 10 heures                                                                                                                             |
| **Dépendances**      | Aucune                                                                                                                                |

#### **Critères d'Acceptation**

- Document de spécifications fonctionnelles rédigé
- Diagrammes de cas d'utilisation (UML) créés
- User Stories du Product Backlog validées
- Documentation intégrée au dépôt Git (/docs)
- Validation par l'encadreur

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                         | **Techno**       | **Estimation** | **Statut** |
| ------------ | ------------------------------------------------------- | ---------------- | -------------- | ---------- |
| **T-005.1**  | Rédiger les exigences fonctionnelles (Chapitre 3.2)     | Word/LaTeX       | 3h             | ☐          |
| **T-005.2**  | Rédiger les exigences non fonctionnelles (Chapitre 3.3) | Word/LaTeX       | 2h             | ☐          |
| **T-005.3**  | Créer les diagrammes de cas d'utilisation               | PlantUML/Draw.io | 2h             | ☐          |
| **T-005.4**  | Documenter les scénarios d'utilisation (Chapitre 3.4)   | Word/LaTeX       | 2h             | ☐          |
| **T-005.5**  | Revue et validation avec l'encadreur                    | Réunion          | 1h             | ☐          |

**Tableau des Tâches du Sprint 1**

| **ID**    | **User Story** | **Tâche**                            | **Techno** | **Est. (h)** | **Restant (h)** | **Statut** | **Assigné à** |
| --------- | -------------- | ------------------------------------ | ---------- | ------------ | --------------- | ---------- | ------------- |
| T-001.1   | US-001         | Créer structure dossiers             | FS         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-001.2   | US-001         | Initialiser Git                      | Git        | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-001.3   | US-001         | Configurer venv Python               | Python     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-001.4   | US-001         | Créer Dockerfile de base             | Docker     | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-001.5   | US-001         | Rédiger README.md                    | Markdown   | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-001.6   | US-001         | Configurer .gitignore                | Git        | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-001.7   | US-001         | Test environnement                   | Test       | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-002.1   | US-002         | Modèle de données User               | SQLAlchemy | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-002.2   | US-002         | Migration BDD                        | Alembic    | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-002.3   | US-002         | Endpoint POST /register              | FastAPI    | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-002.4   | US-002         | Hachage mot de passe                 | bcrypt     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-002.5   | US-002         | Formulaire frontend                  | React      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-002.6   | US-002         | Validation inputs                    | Frontend   | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-002.7   | US-002         | Service email                        | SMTP       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-002.8   | US-002         | Tests unitaires                      | pytest     | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-003.1   | US-003         | Endpoint POST /login                 | FastAPI    | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-003.2   | US-003         | Génération JWT                       | PyJWT      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-003.3   | US-003         | Middleware auth                      | FastAPI    | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-003.4   | US-003         | Formulaire connexion                 | React      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-003.5   | US-003         | Stockage token client                | JS         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-003.6   | US-003         | Fonction déconnexion                 | Fullstack  | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-003.7   | US-003         | Rate limiting                        | Slowapi    | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-003.8   | US-003         | Tests intégration                    | pytest     | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-004.1   | US-004         | Modèle AuditLog                      | SQLAlchemy | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-004.2   | US-004         | Migration BDD logs                   | Alembic    | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-004.3   | US-004         | Logger endpoints auth                | Python     | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-004.4   | US-004         | Capturer IP client                   | FastAPI    | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-004.5   | US-004         | Endpoint GET /logs                   | FastAPI    | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-004.6   | US-004         | Politique rétention                  | Config     | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-004.7   | US-004         | Tests journalisation                 | pytest     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-005.1   | US-005         | Rédiger exigences fonctionnelles     | LaTeX      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-005.2   | US-005         | Rédiger exigences non fonctionnelles | LaTeX      | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-005.3   | US-005         | Diagrammes UML                       | PlantUML   | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-005.4   | US-005         | Scénarios d'utilisation              | LaTeX      | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-005.5   | US-005         | Revue avec encadreur                 | Réunion    | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| **TOTAL** | &nbsp;         | &nbsp;                               | &nbsp;     | **170h**     | &nbsp;          | &nbsp;     | &nbsp;        |

### Risk Log (Journal des Risques) - Sprint 1

| **ID**    | **Risque**                                   | **Impact** | **Probabilité** | **Mitigation**                                          | **Statut** |
| --------- | -------------------------------------------- | ---------- | --------------- | ------------------------------------------------------- | ---------- |
| **R-001** | Problèmes de configuration Docker            | Moyen      | Moyenne         | Utiliser des images officielles, documenter les erreurs | ☐ Ouvert   |
| **R-002** | Délais de validation encadreur               | Élevé      | Moyenne         | Prévoir rendez-vous fixe hebdomadaire                   | ☐ Ouvert   |
| **R-003** | Complexité JWT/Security                      | Moyen      | Faible          | Utiliser librairies éprouvées (PyJWT, FastAPI Security) | ☐ Ouvert   |
| **R-004** | Surcharge de travail (Sprint trop ambitieux) | Élevé      | Moyenne         | Prioriser les Must Have, reporter les bonus             | ☐ Ouvert   |

### Definition of Done

Pour qu'une tâche soit considérée comme **terminée** dans ce Sprint :

| **Critère**   | **Vérification**                                                              |
| ------------- | ----------------------------------------------------------------------------- |
| Code          | Code développé, commité et **pushé<sup>[\[16\]](#footnote-16)</sup>** sur Git |
| Tests         | Tests unitaires passants                                                      |
| Review        | Code reviewé                                                                  |
| Documentation | Code commenté, README mis à jour                                              |
| Démo          | Fonctionnalité démontrable localement                                         |
| Mémoire       | Section correspondante du mémoire rédigée                                     |

# Sprint 2 Backlog - "Données & Prétraitement"

Ce Sprint 2 constitue le socle technique pour l'alimentation du modèle IA en données de qualité.

## 1\. Informations du Sprint

| **Information**                      | **Détail**                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nom du Sprint**                    | Sprint 2 - Données & Prétraitement                                                                                                           |
| **Durée**                            | 2 semaines                                                                                                                                   |
| **Date de début**                    | 02/03/2026                                                                                                                                   |
| **Date de fin**                      | 15/03/2026                                                                                                                                   |
| **Objectif du Sprint (Sprint Goal)** | Mettre en place le pipeline d'ingestion et de prétraitement des images médicales (DICOM), avec anonymisation RGPD et augmentation de données |
| **Capacity Totale**                  | 170 heures (équivalent 25 Story Points)                                                                                                      |
| **Dépendances Sprint 1**             | US-001 (Environnement), US-002 à US-005 (Authentification)                                                                                   |

## 2\. User Stories Détaillées du Sprint 2

### US-006 : Upload d'images médicales (DICOM, PNG, JPG)

| **Champ**            | **Description**                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Upload d'images médicales                                                                                                       |
| **Description**      | En tant que **médecin utilisateur**, je veux **pouvoir uploader des images médicales** afin de **les soumettre à l'analyse IA** |
| **Priorité**         | Must Have                                                                                                                       |
| **Story Points**     | 5                                                                                                                               |
| **Estimation Temps** | 20 heures                                                                                                                       |
| **Dépendances**      | US-001, US-003 (Authentification)                                                                                               |

#### **Critères d'Acceptation**

- Support des formats DICOM (Digital Imaging and Communications in Medicine) (.dcm), PNG, JPG
- Limite de taille configurable (ex: 50MB par fichier)
- Upload multiple (batch) fonctionnel
- Barre de progression visible pendant l'upload
- Notification de succès/échec après upload
- Fichiers stockés de manière sécurisée (chiffrés)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                     | **Techno**   | **Estimation** | **Statut** |
| ------------ | --------------------------------------------------- | ------------ | -------------- | ---------- |
| **T-006.1**  | Concevoir le modèle de données MedicalImage         | SQLAlchemy   | 2h             | ☐          |
| **T-006.2**  | Créer la migration de base de données               | Alembic      | 1h             | ☐          |
| **T-006.3**  | Développer l'endpoint API POST /upload              | FastAPI      | 4h             | ☐          |
| **T-006.4**  | Implémenter la validation des types de fichiers     | Python       | 2h             | ☐          |
| **T-006.5**  | Configurer le stockage sécurisé (MinIO/S3 ou local) | Storage      | 3h             | ☐          |
| **T-006.6**  | Créer le composant frontend d'upload (drag & drop)  | React        | 4h             | ☐          |
| **T-006.7**  | Implémenter la barre de progression                 | JS/Frontend  | 2h             | ☐          |
| **T-006.8**  | Chiffrer les fichiers stockés (AES-256)             | Cryptography | 2h             | ☐          |

### US-007 : Validation des fichiers médicaux

| **Champ**            | **Description**                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Titre**            | Validation des fichiers médicaux                                                                                                           |
| **Description**      | En tant que **système**, je veux **valider l'intégrité des fichiers uploadés** afin de **rejeter les fichiers corrompus ou non conformes** |
| **Priorité**         | Must Have                                                                                                                                  |
| **Story Points**     | 3                                                                                                                                          |
| **Estimation Temps** | 14 heures                                                                                                                                  |
| **Dépendances**      | US-006 (Upload)                                                                                                                            |

**Critères d'Acceptation**

- Vérification de la signature DICOM (Preamble + DICM)
- Validation des métadonnées obligatoires (Modalité, PatientID, etc.)
- Détection des fichiers corrompus ou incomplets
- Message d'erreur explicite pour l'utilisateur
- Logs de validation stockés pour audit
- Tests unitaires pour chaque type de validation

**Tâches Techniques Associées**

| **ID Tâche** | **Description**                              | **Techno** | **Estimation** | **Statut** |
| ------------ | -------------------------------------------- | ---------- | -------------- | ---------- |
| **T-007.1**  | Implémenter la lecture DICOM avec pydicom    | pydicom    | 3h             | ☐          |
| **T-007.2**  | Vérifier la structure DICOM (Preamble, DICM) | pydicom    | 2h             | ☐          |
| **T-007.3**  | Valider les métadonnées obligatoires         | Python     | 2h             | ☐          |
| **T-007.4**  | Détecter les fichiers corrompus (try/except) | Python     | 2h             | ☐          |
| **T-007.5**  | Créer les messages d'erreur utilisateur      | Frontend   | 2h             | ☐          |
| **T-007.6**  | Logger les échecs de validation              | Logging    | 1h             | ☐          |
| **T-007.7**  | Écrire les tests unitaires de validation     | pytest     | 2h             | ☐          |

### US-008 : Anonymisation automatique des DICOM (RGPD)

| **Champ**            | **Description**                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Anonymisation automatique des DICOM (Digital Imaging and Communications in Medicine)                                                                      |
| **Description**      | En tant que **Responsable Sécurité (RGPD)**, je veux **anonymiser les métadonnées patients** afin de **garantir la confidentialité des données de santé** |
| **Priorité**         | Must Have                                                                                                                                                 |
| **Story Points**     | 8                                                                                                                                                         |
| **Estimation Temps** | 28 heures                                                                                                                                                 |
| **Dépendances**      | US-007 (Validation), Chapitre 6 (Sécurité)                                                                                                                |

**Critères d'Acceptation**

- Suppression des 18 identifiants HIPAA/RGPD (nom, date de naissance, etc.)
- Conservation des métadonnées techniques nécessaires (Modalité, BodyPart, etc.)
- Génération d'un ID anonyme unique par patient
- Table de correspondance sécurisée (réversible uniquement par admin)
- Audit log de chaque anonymisation
- Conformité validée avec la checklist RGPD (Chapitre 6.3)

**Tâches Techniques Associées**

| **ID Tâche** | **Description**                                           | **Techno**   | **Estimation** | **Statut** |
| ------------ | --------------------------------------------------------- | ------------ | -------------- | ---------- |
| **T-008.1**  | Identifier les tags DICOM sensibles (liste RGPD)          | pydicom      | 3h             | ☐          |
| **T-008.2**  | Implémenter la fonction d'anonymisation                   | Python       | 5h             | ☐          |
| **T-008.3**  | Créer la table de correspondance (PatientID ↔ AnonID)     | SQLAlchemy   | 3h             | ☐          |
| **T-008.4**  | Chiffrer la table de correspondance                       | Cryptography | 3h             | ☐          |
| **T-008.5**  | Créer l'endpoint admin pour ré-identification (si besoin) | FastAPI      | 3h             | ☐          |
| **T-008.6**  | Logger chaque action d'anonymisation (AuditLog)           | Logging      | 2h             | ☐          |
| **T-008.7**  | Tester l'anonymisation sur un dataset public              | Test         | 4h             | ☐          |
| **T-008.8**  | Rédiger la documentation de conformité RGPD               | LaTeX/Word   | 3h             | ☐          |
| **T-008.9**  | Validation sécurité avec l'encadreur                      | Réunion      | 2h             | ☐          |

### US-009 : Prétraitement des images (normalisation & augmentation)

| **Champ**            | **Description**                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Prétraitement des images                                                                                                    |
| **Description**      | En tant que **Data Scientist**, je veux **prétraiter les images** afin de **les préparer pour l'entraînement du modèle IA** |
| **Priorité**         | Must Have                                                                                                                   |
| **Story Points**     | 5                                                                                                                           |
| **Estimation Temps** | 22 heures                                                                                                                   |
| **Dépendances**      | US-008 (Anonymisation)                                                                                                      |

**Critères d'Acceptation**

- Conversion DICOM - Numpy Array (pixels)
- Normalisation des valeurs de pixels (0-1 ou -1 à 1)
- Redimensionnement uniforme (ex: 224x224 ou 512x512)
- Application de techniques d'augmentation (rotation, flip, zoom)
- Pipeline de prétraitement reproductible
- Documentation du pipeline (Chapitre 2 & 8)

**Tâches Techniques Associées**

| **ID Tâche** | **Description**                                         | **Techno**     | **Estimation** | **Statut** |
| ------------ | ------------------------------------------------------- | -------------- | -------------- | ---------- |
| **T-009.1**  | Implémenter la conversion DICOM → Numpy                 | pydicom/NumPy  | 3h             | ☐          |
| **T-009.2**  | Créer la fonction de normalisation des pixels           | NumPy          | 2h             | ☐          |
| **T-009.3**  | Implémenter le resizing uniforme                        | OpenCV/PIL     | 2h             | ☐          |
| **T-009.4**  | Créer le pipeline d'augmentation (rotation, flip, etc.) | Albumentations | 4h             | ☐          |
| **T-009.5**  | Configurer les paramètres d'augmentation                | Config         | 2h             | ☐          |
| **T-009.6**  | Tester le pipeline sur un échantillon d'images          | Test           | 3h             | ☐          |
| **T-009.7**  | Optimiser les performances (batch processing)           | NumPy          | 3h             | ☐          |
| **T-009.8**  | Documenter le pipeline (Chapitre 2.1)                   | LaTeX/Word     | 3h             | ☐          |

### US-010 : Gestion des erreurs d'upload

| **Champ**            | **Description**                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Gestion des erreurs d'upload                                                                                                             |
| **Description**      | En tant que **utilisateur**, je veux **recevoir des messages d'erreur clairs** afin de **comprendre et corriger les problèmes d'upload** |
| **Priorité**         | Should Have                                                                                                                              |
| **Story Points**     | 3                                                                                                                                        |
| **Estimation Temps** | 12 heures                                                                                                                                |
| **Dépendances**      | US-006, US-007                                                                                                                           |

**Critères d'Acceptation**

- Messages d'erreur human-readable (pas de stack traces)
- Codes d'erreur HTTP appropriés (400, 413, 415, 500)
- Suggestions de correction affichées à l'utilisateur
- Logs d'erreur côté serveur pour débogage
- Tests de chaque scénario d'erreur

**Tâches Techniques Associées**

| **ID Tâche** | **Description**                                     | **Techno**    | **Estimation** | **Statut** |
| ------------ | --------------------------------------------------- | ------------- | -------------- | ---------- |
| **T-010.1**  | Définir la liste des erreurs possibles              | Documentation | 1h             | ☐          |
| **T-010.2**  | Créer les messages d'erreur utilisateur             | Frontend      | 2h             | ☐          |
| **T-010.3**  | Implémenter les codes HTTP appropriés               | FastAPI       | 2h             | ☐          |
| **T-010.4**  | Logger les erreurs serveur (sans données sensibles) | Logging       | 2h             | ☐          |
| **T-010.5**  | Tester chaque scénario d'erreur                     | pytest        | 3h             | ☐          |
| **T-010.6**  | Traduire les messages (FR/EN si nécessaire)         | i18n          | 2h             | ☐          |

### US-041 : Collecte et préparation des datasets publics

| **Champ**            | **Description**                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Collecte et préparation des datasets publics                                                                                                             |
| **Description**      | En tant que **Data Scientist**, je veux **télécharger et organiser les datasets publics** afin de **disposer de données pour l'entraînement (Sprint 3)** |
| **Priorité**         | Must Have                                                                                                                                                |
| **Story Points**     | 5                                                                                                                                                        |
| **Estimation Temps** | 16 heures                                                                                                                                                |
| **Dépendances**      | US-001 (Environnement)                                                                                                                                   |

**Critères d'Acceptation**

- Datasets identifiés (NIH Chest X-ray, CheXpert, Kaggle, etc.)
- Téléchargement et stockage local/sécurisé
- Organisation en dossiers (train/val/test)
- Documentation des sources et licences
- Statistiques des datasets (nombre d'images, classes, etc.)

**Tâches Techniques Associées**

| **ID Tâche** | **Description**                                    | **Techno**  | **Estimation** | **Statut** |
| ------------ | -------------------------------------------------- | ----------- | -------------- | ---------- |
| **T-041.1**  | Identifier et sélectionner les datasets pertinents | Recherche   | 2h             | ☐          |
| **T-041.2**  | Télécharger les datasets (scripts automatisés)     | Python/Wget | 3h             | ☐          |
| **T-041.3**  | Organiser la structure de dossiers                 | File System | 2h             | ☐          |
| **T-041.4**  | Créer un script de vérification d'intégrité        | Python      | 2h             | ☐          |
| **T-041.5**  | Documenter les sources et licences                 | Markdown    | 2h             | ☐          |
| **T-041.6**  | Générer des statistiques descriptives              | Pandas      | 3h             | ☐          |
| **T-041.7**  | Rédiger la section dataset du mémoire (Chapitre 2) | LaTeX/Word  | 2h             | ☐          |

### Tableau des Tâches du Sprint

| **ID**    | **User Story** | **Tâche**                                                                   | **Techno**     | **Est. (h)** | **Restant (h)** | **Statut** | **Assigné à** |
| --------- | -------------- | --------------------------------------------------------------------------- | -------------- | ------------ | --------------- | ---------- | ------------- |
| T-006.1   | US-006         | Modèle de données MedicalImage                                              | SQLAlchemy     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-006.2   | US-006         | Migration BDD                                                               | Alembic        | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-006.3   | US-006         | Endpoint POST /upload                                                       | FastAPI        | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-006.4   | US-006         | Validation types de fichiers                                                | Python         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-006.5   | US-006         | Stockage sécurisé (MinIO/S3)                                                | Storage        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-006.6   | US-006         | Composant frontend upload                                                   | React          | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-006.7   | US-006         | Barre de progression                                                        | JS             | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-006.8   | US-006         | Chiffrement fichiers stockés                                                | Crypto         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-007.1   | US-007         | Lecture DICOM (Digital Imaging and Communications in Medicine) avec pydicom | pydicom        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-007.2   | US-007         | Vérifier structure DICOM                                                    | pydicom        | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-007.3   | US-007         | Valider métadonnées obligatoires                                            | Python         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-007.4   | US-007         | Détecter fichiers corrompus                                                 | Python         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-007.5   | US-007         | Messages d'erreur utilisateur                                               | Frontend       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-007.6   | US-007         | Logger les échecs de validation                                             | Logging        | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-007.7   | US-007         | Tests unitaires de validation                                               | pytest         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.1   | US-008         | Identifier tags DICOM sensibles                                             | pydicom        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.2   | US-008         | Fonction d'anonymisation                                                    | Python         | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.3   | US-008         | Table de correspondance                                                     | SQLAlchemy     | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.4   | US-008         | Chiffrer table de correspondance                                            | Crypto         | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.5   | US-008         | Endpoint admin ré-identification                                            | FastAPI        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.6   | US-008         | Logger anonymisation (AuditLog)                                             | Logging        | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.7   | US-008         | Tester anonymisation dataset                                                | Test           | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.8   | US-008         | Documentation conformité RGPD                                               | LaTeX          | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-008.9   | US-008         | Validation sécurité encadreur                                               | Réunion        | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-009.1   | US-009         | Conversion DICOM → Numpy                                                    | pydicom        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-009.2   | US-009         | Normalisation des pixels                                                    | NumPy          | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-009.3   | US-009         | Resizing uniforme                                                           | OpenCV         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-009.4   | US-009         | Pipeline d'augmentation                                                     | Albumentations | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-009.5   | US-009         | Configurer paramètres augmentation                                          | Config         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-009.6   | US-009         | Tester pipeline échantillon                                                 | Test           | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-009.7   | US-009         | Optimiser performances (batch)                                              | NumPy          | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-009.8   | US-009         | Documenter pipeline (Chapitre 2)                                            | LaTeX          | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-010.1   | US-010         | Définir liste des erreurs                                                   | Doc            | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-010.2   | US-010         | Messages d'erreur utilisateur                                               | Frontend       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-010.3   | US-010         | Codes HTTP appropriés                                                       | FastAPI        | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-010.4   | US-010         | Logger erreurs serveur                                                      | Logging        | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-010.5   | US-010         | Tester scénarios d'erreur                                                   | pytest         | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-010.6   | US-010         | Traduction messages (FR/EN)                                                 | i18n           | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-041.1   | US-041         | Identifier datasets pertinents                                              | Recherche      | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-041.2   | US-041         | Télécharger datasets                                                        | Python         | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-041.3   | US-041         | Organiser structure dossiers                                                | FS             | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-041.4   | US-041         | Script vérification intégrité                                               | Python         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-041.5   | US-041         | Documenter sources et licences                                              | Markdown       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-041.6   | US-041         | Générer statistiques descriptives                                           | Pandas         | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-041.7   | US-041         | Rédiger section dataset (Chapitre 2)                                        | LaTeX          | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| **TOTAL** | &nbsp;         | &nbsp;                                                                      | &nbsp;         | **170h**     | &nbsp;          | &nbsp;     | &nbsp;        |

### Risk Log (Journal des Risques) - Sprint 2

| **ID**    | **Risque**                                                                  | **Impact** | **Probabilité** | **Mitigation**                                    | **Statut** |
| --------- | --------------------------------------------------------------------------- | ---------- | --------------- | ------------------------------------------------- | ---------- |
| **R-005** | Complexité du format DICOM (Digital Imaging and Communications in Medicine) | Élevé      | Moyenne         | Utiliser **pydicom**, tester sur datasets publics | ☐ Ouvert   |
| **R-006** | Volume des données à télécharger                                            | Moyen      | Élevée          | Pré-télécharger avant le S2, utiliser mirrors     | ☐ Ouvert   |
| **R-007** | Anonymisation incomplète (RGPD)                                             | Élevé      | Moyenne         | Checklist RGPD stricte, validation encadreur      | ☐ Ouvert   |
| **R-008** | Performance prétraitement lent                                              | Moyen      | Faible          | Profiler code, optimiser avec NumPy batch         | ☐ Ouvert   |
| **R-009** | Perte de données pendant upload                                             | Élevé      | Faible          | Transactionnel, rollback, checksum                | ☐ Ouvert   |
| **R-010** | Délais de validation encadreur                                              | Élevé      | Moyenne         | Rendez-vous fixe J5 du Sprint                     | ☐ Ouvert   |

### Definition of Done

Pour qu'une tâche soit considérée comme **terminée** dans ce Sprint :

| **Critère**   | **Vérification**                                          |
| ------------- | --------------------------------------------------------- |
| Code          | Code développé, commité et pushé sur Git                  |
| Tests         | Tests unitaires passants (couverture > 80%)               |
| Review        | Code reviewé                                              |
| Documentation | Code commenté, README mis à jour, section mémoire rédigée |
| Sécurité      | Pas de données sensibles en clair, anonymisation validée  |
| Démo          | Fonctionnalité démontrable localement                     |

# Sprint 3 Backlog- "Modèle IA & Entraînement"

Ce Sprint 3 constitue le cœur scientifique du projet, où le modèle de Deep Learning est développé, entraîné et évalué.

## 1\. Informations du Sprint

| **Information**                      | **Détail**                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Nom du Sprint**                    | Sprint 3 - Modèle IA & Entraînement                                                                                                      |
| **Durée**                            | 2 semaines                                                                                                                               |
| **Date de début**                    | 16/03/2026                                                                                                                               |
| **Date de fin**                      | 29/03/2026                                                                                                                               |
| **Objectif du Sprint (Sprint Goal)** | Développer, entraîner et évaluer le modèle de Deep Learning pour la classification pulmonaire, avec intégration de l'explicabilité (XAI) |
| **Capacity Totale**                  | 255 heures (équivalent 35 Story Points)                                                                                                  |
| **Dépendances Sprint 2**             | US-006 à US-010 (Pipeline de données), US-041 (Datasets)                                                                                 |

## 2\. User Stories Détaillées du Sprint 3

### US-011 : Intégration du modèle de classification

| **Champ**            | **Description**                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Titre**            | Intégration du modèle de classification                                                                                                                            |
| **Description**      | En tant que **Data Scientist**, je veux **intégrer un modèle de classification pré-entraîné** afin de **pouvoir effectuer l'inférence sur les images pulmonaires** |
| **Priorité**         | Must Have                                                                                                                                                          |
| **Story Points**     | 13                                                                                                                                                                 |
| **Estimation Temps** | 45 heures                                                                                                                                                          |
| **Dépendances**      | US-009 (Prétraitement), US-041 (Datasets)                                                                                                                          |

#### **Critères d'Acceptation**

- Architecture CNN choisie et documentée (**ResNet<sup>[\[17\]](#footnote-17)</sup>**, **EfficientNet<sup>[\[18\]](#footnote-18)</sup>**, ou **ViT<sup>[\[19\]](#footnote-19)</sup>**)
- Modèle chargé et fonctionnel via API
- Inférence testée sur un batch d'images
- Temps d'inférence < 5 secondes par image
- Code versionné et documenté (Chapitre 2 & 8)
- Tests unitaires pour l'inférence

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                                                                                | **Techno**  | **Estimation** | **Statut** |
| ------------ | -------------------------------------------------------------------------------------------------------------- | ----------- | -------------- | ---------- |
| **T-011.1**  | Sélectionner l'architecture CNN (revue de la littérature)                                                      | Recherche   | 4h             | ☐          |
| **T-011.2**  | Implémenter l'architecture du modèle                                                                           | PyTorch/TF  | 8h             | ☐          |
| **T-011.3**  | Charger les poids pré-entraînés (Transfer Learning)                                                            | TorchVision | 3h             | ☐          |
| **T-011.4**  | Créer l'_endpoint_ API POST /predict                                                                           | FastAPI     | 5h             | ☐          |
| **T-011.5**  | Intégrer le pipeline de prétraitement dans l'inférence                                                         | Python      | 4h             | ☐          |
| **T-011.6**  | Optimiser le temps d'inférence **GPU/CPU** (Graphical Processing Unit / Central Processing Unit)               | CUDA/ONNX   | 6h             | ☐          |
| **T-011.7**  | Écrire les tests unitaires d'inférence                                                                         | pytest      | 5h             | ☐          |
| **T-011.8**  | Documenter l'architecture (Chapitre 2.3)                                                                       | LaTeX/Word  | 5h             | ☐          |
| **T-011.9**  | Versionner le modèle (**DVC**<sup>[\[20\]](#footnote-20)</sup> ou **MLflow<sup>[\[21\]](#footnote-21)</sup>**) | DVC/MLflow  | 5h             | ☐          |

### US-012 : Entraînement du modèle sur les pathologies pulmonaires

| **Champ**            | **Description**                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Entraînement du modèle                                                                                                                                                |
| **Description**      | En tant que **Data Scientist**, je veux **entraîner le modèle sur les datasets pulmonaires** afin de **spécialiser le modèle pour la classification des pathologies** |
| **Priorité**         | Must Have                                                                                                                                                             |
| **Story Points**     | 13                                                                                                                                                                    |
| **Estimation Temps** | 50 heures                                                                                                                                                             |
| **Dépendances**      | US-011 (Modèle), US-041 (Datasets)                                                                                                                                    |

#### **Critères d'Acceptation**

- Dataset divisé (train/validation/test : 70/15/15)
- Fonction de perte adaptée (Cross-Entropy, Focal Loss)
- Optimiseur configuré (Adam, SGD)
- Callbacks implémentés (EarlyStopping, ModelCheckpoint)
- Courbes d'apprentissage générées (loss, accuracy)
- Modèle final sauvegardé avec les meilleurs poids
- Documentation du processus d'entraînement (Chapitre 8)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                                               | **Techno**  | **Estimation** | **Statut** |
| ------------ | ----------------------------------------------------------------------------- | ----------- | -------------- | ---------- |
| **T-012.1**  | Split des datasets (train/validation/test)                                    | Python      | 3h             | ☐          |
| **T-012.2**  | Créer les DataLoaders (batching, shuffle)                                     | PyTorch     | 4h             | ☐          |
| **T-012.3**  | Implémenter la fonction de perte (Loss)                                       | PyTorch     | 3h             | ☐          |
| **T-012.4**  | Configurer l'optimiseur et le scheduler                                       | PyTorch     | 3h             | ☐          |
| **T-012.5**  | Implémenter les callbacks (EarlyStopping, etc.)                               | PyTorch     | 4h             | ☐          |
| **T-012.6**  | Lancer l'entraînement (plusieurs **epochs<sup>[\[22\]](#footnote-22)</sup>**) | GPU/Cloud   | 10h            | ☐          |
| **T-012.7**  | Monitorer les métriques en temps réel                                         | TensorBoard | 4h             | ☐          |
| **T-012.8**  | Sauvegarder les meilleurs poids (checkpoint)                                  | File System | 2h             | ☐          |
| **T-012.9**  | Générer les courbes d'apprentissage                                           | Matplotlib  | 3h             | ☐          |
| **T-012.10** | Documenter le processus (Chapitre 8.2)                                        | LaTeX/Word  | 5h             | ☐          |
| **T-012.11** | Versionner les expériences (MLflow)                                           | MLflow      | 5h             | ☐          |
| **T-012.12** | Backup du modèle entraîné                                                     | Storage     | 4h             | ☐          |

### US-013 : Génération de Heatmaps (Grad-CAM / XAI)

| **Champ**            | **Description**                                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Génération de Heatmaps (Explicabilité)                                                                                                                      |
| **Description**      | En tant que **médecin utilisateur**, je veux **visualiser les zones d'intérêt sur l'image** afin de **comprendre pourquoi le modèle a pris cette décision** |
| **Priorité**         | Must Have                                                                                                                                                   |
| **Story Points**     | 8                                                                                                                                                           |
| **Estimation Temps** | 35 heures                                                                                                                                                   |
| **Dépendances**      | US-011 (Modèle), Chapitre 2.3.6 (Interprétabilité)                                                                                                          |

#### **Critères d'Acceptation**

- Algorithme Grad-CAM implémenté et fonctionnel
- Heatmap superposée sur l'image originale
- Code couleur intuitif (rouge = zone d'intérêt)
- Export de l'image avec heatmap (PNG)
- Endpoint API dédié GET /heatmap
- Documentation de l'XAI (Chapitre 2.3.6)
- Tests de cohérence des heatmaps

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                  | **Techno** | **Estimation** | **Statut** |
| ------------ | ------------------------------------------------ | ---------- | -------------- | ---------- |
| **T-013.1**  | Étudier les algorithmes XAI (Grad-CAM, Saliency) | Recherche  | 4h             | ☐          |
| **T-013.2**  | Implémenter Grad-CAM pour le modèle choisi       | PyTorch    | 8h             | ☐          |
| **T-013.3**  | Créer la fonction de superposition heatmap/image | OpenCV     | 4h             | ☐          |
| **T-013.4**  | Configurer la palette de couleurs (heatmap)      | Matplotlib | 2h             | ☐          |
| **T-013.5**  | Créer l'endpoint API GET /heatmap                | FastAPI    | 4h             | ☐          |
| **T-013.6**  | Intégrer l'export PNG avec heatmap               | Python     | 3h             | ☐          |
| **T-013.7**  | Tester la cohérence des zones détectées          | Test       | 4h             | ☐          |
| **T-013.8**  | Documenter l'XAI (Chapitre 2.3.6)                | LaTeX/Word | 4h             | ☐          |
| **T-013.9**  | Comparer avec d'autres méthodes XAI (optionnel)  | Captum     | 2h             | ☐          |

### US-014 : Score de confiance du diagnostic

| **Champ**            | **Description**                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Score de confiance du diagnostic                                                                                                                     |
| **Description**      | En tant que **médecin utilisateur**, je veux **voir le score de confiance du modèle** afin de **pouvoir évaluer la fiabilité du diagnostic proposé** |
| **Priorité**         | Must Have                                                                                                                                            |
| **Story Points**     | 3                                                                                                                                                    |
| **Estimation Temps** | 15 heures                                                                                                                                            |
| **Dépendances**      | US-011 (Modèle)                                                                                                                                      |

#### **Critères d'Acceptation**

- Score de confiance calculé (**softmax**<sup>[\[23\]](#footnote-23)</sup> probability)
- Affichage en pourcentage (0-100%)
- Seuil de confiance configurable (ex: 70%)
- Indication visuelle (vert/orange/rouge) selon le score
- Intégré dans la réponse API /predict
- Documenté dans le Chapitre 4

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                | **Techno** | **Estimation** | **Statut** |
| ------------ | ---------------------------------------------- | ---------- | -------------- | ---------- |
| **T-014.1**  | Implémenter le calcul de probabilité (softmax) | PyTorch    | 2h             | ☐          |
| **T-014.2**  | Convertir en pourcentage lisible               | Python     | 1h             | ☐          |
| **T-014.3**  | Définir les seuils de confiance (config)       | Config     | 2h             | ☐          |
| **T-014.4**  | Intégrer dans la réponse API /predict          | FastAPI    | 3h             | ☐          |
| **T-014.5**  | Créer l'indicateur visuel frontend             | React      | 3h             | ☐          |
| **T-014.6**  | Tester les différents niveaux de confiance     | Test       | 2h             | ☐          |
| **T-014.7**  | Documenter (Chapitre 4.2.3)                    | LaTeX/Word | 2h             | ☐          |

### US-015 : Gestion des cas ambigus (faible confiance)

| **Champ**            | **Description**                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Gestion des cas ambigus                                                                                                            |
| **Description**      | En tant que **système**, je veux **identifier les cas à faible confiance** afin de **les signaler pour revue humaine obligatoire** |
| **Priorité**         | Should Have                                                                                                                        |
| **Story Points**     | 5                                                                                                                                  |
| **Estimation Temps** | 20 heures                                                                                                                          |
| **Dépendances**      | US-014 (Score de confiance)                                                                                                        |

#### **Critères d'Acceptation**

- Détection automatique des scores < seuil
- _Flag_ "À revoir" ajouté au résultat
- Notification pour l'administrateur/médecin senior
- Liste des cas ambigus consultable
- Workflow de validation humaine prévu
- Documenté dans le Chapitre 4

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                | **Techno** | **Estimation** | **Statut** |
| ------------ | ---------------------------------------------- | ---------- | -------------- | ---------- |
| **T-015.1**  | Définir le seuil de confiance critique         | Config     | 2h             | ☐          |
| **T-015.2**  | Implémenter la logique de détection            | Python     | 3h             | ☐          |
| **T-015.3**  | Ajouter le _flag_ dans le modèle de données    | SQLAlchemy | 2h             | ☐          |
| **T-015.4**  | Créer l'endpoint GET /ambiguous-cases          | FastAPI    | 3h             | ☐          |
| **T-015.5**  | Notification email/alerte pour cas critiques   | SMTP       | 3h             | ☐          |
| **T-015.6**  | Interface frontend pour liste des cas à revoir | React      | 4h             | ☐          |
| **T-015.7**  | Tester le workflow complet                     | Test       | 2h             | ☐          |
| **T-015.8**  | Documenter (Chapitre 4.2.5)                    | LaTeX/Word | 1h             | ☐          |

### US-016 : Optimisation des performances d'inférence

| **Champ**            | **Description**                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Optimisation des performances d'inférence                                                                                                         |
| **Description**      | En tant que **Développeur Performance**, je veux **optimiser le temps d'inférence** afin de **garantir une expérience utilisateur fluide (< 5s)** |
| **Priorité**         | Should Have                                                                                                                                       |
| **Story Points**     | 5                                                                                                                                                 |
| **Estimation Temps** | 22 heures                                                                                                                                         |
| **Dépendances**      | US-011 (Modèle)                                                                                                                                   |

#### **Critères d'Acceptation**

- Temps d'inférence moyen < 5 secondes
- Optimisation GPU (Graphical Processing Unit) activée (si disponible)
- Modèle converti en **ONNX**<sup>[\[24\]](#footnote-24)</sup> (optionnel)
- Batch inference supporté
- Métriques de performance documentées (Chapitre 8)
- Tests de charge réalisés

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                           | **Techno** | **Estimation** | **Statut** |
| ------------ | ----------------------------------------- | ---------- | -------------- | ---------- |
| **T-016.1**  | Profiler le temps d'inférence actuel      | cProfile   | 3h             | ☐          |
| **T-016.2**  | Activer l'accélération GPU (CUDA)         | CUDA       | 4h             | ☐          |
| **T-016.3**  | Convertir le modèle en ONNX (optionnel)   | ONNX       | 4h             | ☐          |
| **T-016.4**  | Implémenter le batch inference            | PyTorch    | 3h             | ☐          |
| **T-016.5**  | Optimiser le preprocessing (pipeline)     | NumPy      | 3h             | ☐          |
| **T-016.6**  | Mettre en cache les modèles chargés       | Redis      | 2h             | ☐          |
| **T-016.7**  | Tests de charge et performance            | Locust     | 2h             | ☐          |
| **T-016.8**  | Documenter les métriques (Chapitre 8.2.3) | LaTeX/Word | 1h             | ☐          |

### US-042 : Évaluation scientifique du modèle (Métriques)

| **Champ**            | **Description**                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Évaluation scientifique du modèle                                                                                                                         |
| **Description**      | En tant que **Chercheur**, je veux **évaluer le modèle avec des métriques scientifiques** afin de **valider la performance pour le mémoire (Chapitre 8)** |
| **Priorité**         | Must Have                                                                                                                                                 |
| **Story Points**     | 8                                                                                                                                                         |
| **Estimation Temps** | 30 heures                                                                                                                                                 |
| **Dépendances**      | US-012 (Entraînement)                                                                                                                                     |

#### **Critères d'Acceptation**

- Matrice de confusion générée
- **Métriques calculées (Accuracy, Precision, Recall, F1-Score)**
- Courbe **ROC** et **AUC** calculées
- Comparaison avec l'état de l'art (Chapitre 2.4)
- Résultats exportés (par exemple les formats de fichiers : CSV ou PNG)
- Section Chapitre 8.2 rédigée

Toutefois, nous devons définir ces notions de « métriques calculées » utilisées dans les classements de modèles d'IA.

Selon le site web <https://www.flowhunt.io/> : Les métriques sont des critères quantitatifs utilisés pour évaluer les performances des modèles d'IA sur les classements. Elles offrent un moyen standardisé de mesurer et comparer les performances des modèles sur des tâches précises.

Quant aux métriques les plus courantes, nous présentons les suivantes :

- **Précision (Accuracy) :** Ratio d'instances correctement prédites sur le nombre total d'instances ; mesure la justesse globale du modèle.
- **Précision (Precision) :** Ratio de prédictions positives correctes sur le nombre total de prédictions positives ; indique la qualité des prédictions positives.
- **Rappel (Recall) :** Ratio de prédictions positives correctes sur le nombre total de cas effectivement positifs ; reflète la capacité du modèle à identifier les cas pertinents.
- **F1-Score :** Moyenne harmonique de la précision et du rappel ; utile pour l'évaluation sur des jeux de données déséquilibrés.
- **Aire sous la courbe ROC (AUC) :** Évalue les performances du modèle sur tous les seuils de classification.
- **Mean Reciprocal Rank (MRR) :** Pertinent dans les systèmes de [recherche](https://www.flowhunt.io/fr/search/) et de recommandation, mesure l'efficacité du classement.

Source : <https://www.flowhunt.io/fr/glossaire/ai-model-accuracy-and-ai-model-stability/#:~:text=M%C3%A9triques%20courantes,la%20qualit%C3%A9%20des%20pr%C3%A9dictions%20positives>.

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                              | **Techno**   | **Estimation** | **Statut** |
| ------------ | -------------------------------------------- | ------------ | -------------- | ---------- |
| **T-042.1**  | Implémenter le calcul des métriques          | Scikit-learn | 4h             | ☐          |
| **T-042.2**  | Générer la matrice de confusion              | Seaborn      | 3h             | ☐          |
| **T-042.3**  | Calculer Precision, Recall, F1-Score         | Scikit-learn | 3h             | ☐          |
| **T-042.4**  | Générer la courbe ROC et AUC                 | Matplotlib   | 4h             | ☐          |
| **T-042.5**  | Comparer avec les benchmarks (état de l'art) | Recherche    | 5h             | ☐          |
| **T-042.6**  | Exporter les résultats (CSV, PNG)            | Python       | 2h             | ☐          |
| **T-042.7**  | Rédiger la section 8.2 du mémoire            | LaTeX/Word   | 6h             | ☐          |
| **T-042.8**  | Validation des résultats avec l'encadreur    | Réunion      | 3h             | ☐          |

### Tableau des Tâches du Sprint

| **ID**    | **User Story** | **Tâche**                                              | **Techno**   | **Est. (h)** | **Restant (h)** | **Statut** | **Assigné à** |
| --------- | -------------- | ------------------------------------------------------ | ------------ | ------------ | --------------- | ---------- | ------------- |
| T-011.1   | US-011         | Sélectionner architecture CNN                          | Recherche    | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-011.2   | US-011         | Implémenter architecture modèle                        | PyTorch      | 8            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-011.3   | US-011         | Charger poids pré-entraînés                            | TorchVision  | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-011.4   | US-011         | Endpoint API POST /predict                             | FastAPI      | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-011.5   | US-011         | Intégrer pipeline prétraitement                        | Python       | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-011.6   | US-011         | Optimiser temps inférence                              | CUDA/ONNX    | 6            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-011.7   | US-011         | Tests unitaires inférence                              | pytest       | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-011.8   | US-011         | Documenter architecture (Chapitre 2)                   | LaTeX        | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-011.9   | US-011         | Versionner modèle (DVC/MLflow)                         | DVC          | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.1   | US-012         | Split datasets (train/val/test)                        | Python       | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.2   | US-012         | Créer **DataLoaders<sup>[\[25\]](#footnote-25)</sup>** | PyTorch      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.3   | US-012         | Implémenter fonction de perte                          | PyTorch      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.4   | US-012         | Configurer optimiseur/scheduler                        | PyTorch      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.5   | US-012         | Implémenter callbacks                                  | PyTorch      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.6   | US-012         | Lancer entraînement (epochs)                           | GPU          | 10           | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.7   | US-012         | Monitorer métriques (TensorBoard)                      | TensorBoard  | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.8   | US-012         | Sauvegarder meilleurs poids                            | File System  | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.9   | US-012         | Générer courbes apprentissage                          | Matplotlib   | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.10  | US-012         | Documenter processus (Chapitre 8)                      | LaTeX        | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.11  | US-012         | Versionner expériences (MLflow)                        | MLflow       | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-012.12  | US-012         | Backup modèle entraîné                                 | Storage      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.1   | US-013         | Étudier algorithmes XAI                                | Recherche    | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.2   | US-013         | Implémenter Grad-CAM                                   | PyTorch      | 8            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.3   | US-013         | Superposition heatmap/image                            | OpenCV       | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.4   | US-013         | Configurer palette couleurs                            | Matplotlib   | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.5   | US-013         | Endpoint API GET /heatmap                              | FastAPI      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.6   | US-013         | Export PNG avec heatmap                                | Python       | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.7   | US-013         | Tester cohérence heatmaps                              | Test         | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.8   | US-013         | Documenter XAI (Chapitre 2.3.6)                        | LaTeX        | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-013.9   | US-013         | Comparer autres méthodes XAI                           | Captum       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-014.1   | US-014         | Calcul probabilité (softmax)                           | PyTorch      | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-014.2   | US-014         | Convertir en pourcentage                               | Python       | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-014.3   | US-014         | Définir seuils confiance                               | Config       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-014.4   | US-014         | Intégrer réponse API /predict                          | FastAPI      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-014.5   | US-014         | Indicateur visuel frontend                             | React        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-014.6   | US-014         | Tester niveaux confiance                               | Test         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-014.7   | US-014         | Documenter (Chapitre 4.2.3)                            | LaTeX        | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-015.1   | US-015         | Définir seuil confiance critique                       | Config       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-015.2   | US-015         | Logique détection cas ambigus                          | Python       | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-015.3   | US-015         | Flag dans modèle de données                            | SQLAlchemy   | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-015.4   | US-015         | Endpoint GET /ambiguous-cases                          | FastAPI      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-015.5   | US-015         | Notification email/alerte                              | SMTP         | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-015.6   | US-015         | Interface frontend cas à revoir                        | React        | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-015.7   | US-015         | Tester workflow complet                                | Test         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-015.8   | US-015         | Documenter (Chapitre 4.2.5)                            | LaTeX        | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-016.1   | US-016         | Profiler temps inférence                               | cProfile     | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-016.2   | US-016         | Activer accélération GPU (Graphical Processing Unit)   | CUDA         | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-016.3   | US-016         | Convertir modèle ONNX                                  | ONNX         | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-016.4   | US-016         | Batch inference                                        | PyTorch      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-016.5   | US-016         | Optimiser preprocessing                                | NumPy        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-016.6   | US-016         | Cache modèles chargés                                  | Redis        | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-016.7   | US-016         | Tests de charge performance                            | Locust       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-016.8   | US-016         | Documenter métriques (Chapitre 8)                      | LaTeX        | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-042.1   | US-042         | Calcul des métriques                                   | Scikit-learn | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-042.2   | US-042         | Matrice de confusion                                   | Seaborn      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-042.3   | US-042         | Precision, Recall, F1-Score                            | Scikit-learn | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-042.4   | US-042         | Courbe ROC et AUC                                      | Matplotlib   | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-042.5   | US-042         | Comparer benchmarks (état de l'art)                    | Recherche    | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-042.6   | US-042         | Export résultats (CSV, PNG)                            | Python       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-042.7   | US-042         | Rédiger section 8.2 mémoire                            | LaTeX        | 6            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-042.8   | US-042         | Validation résultats encadreur                         | Réunion      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| **TOTAL** | &nbsp;         | &nbsp;                                                 | &nbsp;       | **255h**     | &nbsp;          | &nbsp;     | &nbsp;        |

### Risk Log (Journal des Risques) - Sprint 3

| **ID**    | **Risque**                                               | **Impact** | **Probabilité** | **Mitigation**                                                                                                    | **Statut** |
| --------- | -------------------------------------------------------- | ---------- | --------------- | ----------------------------------------------------------------------------------------------------------------- | ---------- |
| **R-011** | Temps d'entraînement trop long                           | Élevé      | Élevée          | Utiliser Transfer Learning, réduire epochs, GPU cloud                                                             | ☐ Ouvert   |
| **R-012** | Modèle ne converge pas (overfitting)                     | Élevé      | Moyenne         | Data Augmentation, Regularization, EarlyStopping                                                                  | ☐ Ouvert   |
| **R-013** | Performance IA insuffisante (< 80%)                      | Élevé      | Moyenne         | Changer architecture, tuner hyperparamètres                                                                       | ☐ Ouvert   |
| **R-014** | Grad-CAM ne produit pas de heatmaps claires              | Moyen      | Moyenne         | Tester autres méthodes XAI (**Saliency<sup>[\[26\]](#footnote-26)</sup>, LIME**<sup>[\[27\]](#footnote-27)</sup>) | ☐ Ouvert   |
| **R-015** | Ressources GPU (Graphical Processing Unit) insuffisantes | Élevé      | Moyenne         | Utiliser Google Colab Pro, Kaggle Kernels, ou cloud                                                               | ☐ Ouvert   |
| **R-016** | Délais d'entraînement impactent le sprint                | Élevé      | Élevée          | Lancer l'entraînement en parallèle d'autres tâches                                                                | ☐ Ouvert   |
| **R-017** | Résultats non reproductibles                             | Moyen      | Faible          | Fixer les seeds, versionner les expériences (MLflow)                                                              | ☐ Ouvert   |
| **R-018** | Validation encadreur retardée                            | Moyen      | Moyenne         | Rendez-vous fixe J10 du Sprint                                                                                    | ☐ Ouvert   |

### Definition of Done

Pour qu'une tâche soit considérée comme **terminée** dans ce Spint :

| **Critère**   | **Vérification**                                          |
| ------------- | --------------------------------------------------------- |
| Code          | Code développé, commité et pushé sur Git                  |
| Tests         | Tests unitaires passants (couverture > 80%)               |
| Review        | Code reviewé                                              |
| Documentation | Code commenté, README mis à jour, section mémoire rédigée |
| Modèle        | Modèle versionné, métriques documentées                   |
| Démo          | Fonctionnalité démontrable localement                     |

# Sprint 4 Backlog - "Intégration Plateforme"

Ce Sprint 4 constitue l'étape d'intégration de tous les composants développés dans les sprints précédents en une plateforme cohérente et utilisable.

## 1\. Informations du Sprint

| **Information**                      | **Détail**                                                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nom du Sprint**                    | Sprint 4 - Intégration Plateforme                                                                                                              |
| **Durée**                            | 2 semaines                                                                                                                                     |
| **Date de début**                    | 30/03/2026                                                                                                                                     |
| **Date de fin**                      | 12/04/2026                                                                                                                                     |
| **Objectif du Sprint (Sprint Goal)** | Intégrer tous les composants (IA, API, Frontend) en une plateforme fonctionnelle avec interface utilisateur complète et génération de rapports |
| **Capacity Totale**                  | 170 heures (équivalent 25 Story Points)                                                                                                        |
| **Dépendances Sprint 3**             | US-011 à US-016 (Modèle IA), US-042 (Évaluation)                                                                                               |
| **Dépendances Sprint 2**             | US-006 à US-010 (Pipeline de données)                                                                                                          |
| **Dépendances Sprint 1**             | US-001 à US-005 (Authentification)                                                                                                             |

## 2\. User Stories Détaillées du Sprint 4

### US-017 : Dashboard principal (Vue d'ensemble)

| **Champ**            | **Description**                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Dashboard principal                                                                                                                                |
| **Description**      | En tant que **médecin utilisateur**, je veux **avoir une vue d'ensemble de mon activité** afin de **suivre mes analyses récentes et statistiques** |
| **Priorité**         | Must Have                                                                                                                                          |
| **Story Points**     | 5                                                                                                                                                  |
| **Estimation Temps** | 20 heures                                                                                                                                          |
| **Dépendances**      | US-003 (Authentification), US-019 (Historique)                                                                                                     |

#### **Critères d'Acceptation**

- Affichage des statistiques personnelles (nombre d'analyses, pathologies détectées)
- Liste des 10 dernières analyses avec statut
- Graphiques de répartition des pathologies (camembert/barres)
- Accès rapide aux fonctionnalités principales
- Responsive design (desktop/tablette)
- Temps de chargement < 2 secondes

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                | **Techno**   | **Estimation** | **Statut** |
| ------------ | ---------------------------------------------- | ------------ | -------------- | ---------- |
| **T-017.1**  | Concevoir la maquette du dashboard             | Figma/Design | 3h             | ☐          |
| **T-017.2**  | Créer le composant Dashboard (React)           | React        | 4h             | ☐          |
| **T-017.3**  | Développer l'endpoint API GET /dashboard/stats | FastAPI      | 3h             | ☐          |
| **T-017.4**  | Implémenter les graphiques (Chart.js/Recharts) | JS Library   | 4h             | ☐          |
| **T-017.5**  | Créer la liste des analyses récentes           | React        | 3h             | ☐          |
| **T-017.6**  | Optimiser le temps de chargement (cache)       | Redis        | 2h             | ☐          |
| **T-017.7**  | Tester le responsive design                    | Test         | 1h             | ☐          |

### US-018 : Visualisation des résultats d'analyse

| **Champ**            | **Description**                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Titre**            | Visualisation des résultats d'analyse                                                                                                      |
| **Description**      | En tant que **médecin utilisateur**, je veux **visualiser les résultats complets d'une analyse** afin de **prendre une décision éclairée** |
| **Priorité**         | Must Have                                                                                                                                  |
| **Story Points**     | 8                                                                                                                                          |
| **Estimation Temps** | 28 heures                                                                                                                                  |
| **Dépendances**      | US-011 (Modèle IA), US-013 (Heatmaps), US-014 (Confiance)                                                                                  |

#### **Critères d'Acceptation**

- Affichage de l'image originale et de la heatmap superposée
- Affichage du diagnostic avec score de confiance
- Indication visuelle de la sévérité (couleurs)
- Comparaison side-by-side (original vs heatmap)
- Zoom et navigation sur l'image
- Bouton d'export de l'image annotée
- Temps d'affichage < 3 secondes

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                 | **Techno**   | **Estimation** | **Statut** |
| ------------ | ----------------------------------------------- | ------------ | -------------- | ---------- |
| **T-018.1**  | Concevoir la page de résultats                  | Figma/Design | 3h             | ☐          |
| **T-018.2**  | Créer le composant ImageViewer avec zoom        | React        | 5h             | ☐          |
| **T-018.3**  | Implémenter la superposition heatmap/image      | Canvas/SVG   | 4h             | ☐          |
| **T-018.4**  | Développer l'endpoint GET /results/:id          | FastAPI      | 3h             | ☐          |
| **T-018.5**  | Afficher le diagnostic et score de confiance    | React        | 3h             | ☐          |
| **T-018.6**  | Implémenter l'indicateur de sévérité (couleurs) | CSS/JS       | 2h             | ☐          |
| **T-018.7**  | Créer le bouton d'export image annotée          | JS           | 3h             | ☐          |
| **T-018.8**  | Optimiser le rendu des images (lazy loading)    | React        | 3h             | ☐          |
| **T-018.9**  | Tests d'interface et performance                | Test         | 2h             | ☐          |

### US-019 : Historique des analyses

| **Champ**            | **Description**                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Historique des analyses                                                                                                                           |
| **Description**      | En tant que **médecin utilisateur**, je veux **consulter l'historique de mes analyses** afin de **suivre l'évolution des patients dans le temps** |
| **Priorité**         | Must Have                                                                                                                                         |
| **Story Points**     | 5                                                                                                                                                 |
| **Estimation Temps** | 22 heures                                                                                                                                         |
| **Dépendances**      | US-006 (Upload), US-011 (Modèle IA)                                                                                                               |

#### **Critères d'Acceptation**

- Liste chronologique de toutes les analyses
- Filtres par date, pathologie, statut, patient
- Recherche par ID d'analyse ou patient
- Pagination des résultats (20 par page)
- Tri par date, confiance, pathologie
- Export de l'historique (CSV)
- Accès rapide aux détails d'une analyse

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                 | **Techno** | **Estimation** | **Statut** |
| ------------ | ----------------------------------------------- | ---------- | -------------- | ---------- |
| **T-019.1**  | Concevoir le modèle de données AnalysisHistory  | SQLAlchemy | 2h             | ☐          |
| **T-019.2**  | Créer la migration de base de données           | Alembic    | 1h             | ☐          |
| **T-019.3**  | Développer l'endpoint GET /history avec filtres | FastAPI    | 4h             | ☐          |
| **T-019.4**  | Implémenter la pagination serveur               | FastAPI    | 2h             | ☐          |
| **T-019.5**  | Créer le composant frontend de liste            | React      | 4h             | ☐          |
| **T-019.6**  | Implémenter les filtres et recherche            | React      | 4h             | ☐          |
| **T-019.7**  | Créer l'export CSV                              | Python/JS  | 2h             | ☐          |
| **T-019.8**  | Tester les performances avec grand volume       | Test       | 2h             | ☐          |
| **T-019.9**  | Documenter (Chapitre 4.2.3)                     | LaTeX/Word | 1h             | ☐          |

### US-020 : Génération de rapport PDF

| **Champ**            | **Description**                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Génération de rapport PDF                                                                                                                          |
| **Description**      | En tant que **médecin utilisateur**, je veux **générer un rapport PDF d'analyse** afin de **pouvoir l'archiver ou le partager avec des collègues** |
| **Priorité**         | Should Have                                                                                                                                        |
| **Story Points**     | 5                                                                                                                                                  |
| **Estimation Temps** | 24 heures                                                                                                                                          |
| **Dépendances**      | US-018 (Visualisation), US-019 (Historique)                                                                                                        |

#### **Critères d'Acceptation**

- Rapport PDF généré automatiquement
- Inclus : image originale, heatmap, diagnostic, confiance, date
- En-tête avec logo de la plateforme et informations médecin
- Pied de page avec mentions légales et disclaimer médical
- Format A4 standard
- Téléchargement direct depuis l'interface
- Stockage du PDF généré (optionnel)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                      | **Techno** | **Estimation** | **Statut** |
| ------------ | ---------------------------------------------------- | ---------- | -------------- | ---------- |
| **T-020.1**  | Sélectionner la librairie PDF (ReportLab/WeasyPrint) | Recherche  | 2h             | ☐          |
| **T-020.2**  | Concevoir le template du rapport                     | HTML/CSS   | 4h             | ☐          |
| **T-020.3**  | Développer l'endpoint GET /report/:id/pdf            | FastAPI    | 4h             | ☐          |
| **T-020.4**  | Intégrer l'image et heatmap dans le PDF              | Python     | 4h             | ☐          |
| **T-020.5**  | Ajouter en-tête et pied de page                      | Python     | 2h             | ☐          |
| **T-020.6**  | Implémenter le disclaimer médical obligatoire        | Text       | 1h             | ☐          |
| **T-020.7**  | Créer le bouton de téléchargement frontend           | React      | 2h             | ☐          |
| **T-020.8**  | Tester la qualité du PDF généré                      | Test       | 3h             | ☐          |
| **T-020.9**  | Documenter (Chapitre 4.2.3)                          | LaTeX/Word | 2h             | ☐          |

### US-021 : Interface responsive (Desktop/Mobile)

| **Champ**            | **Description**                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Titre**            | Interface responsive                                                                                                                                   |
| **Description**      | En tant que **utilisateur mobile**, je veux **pouvoir accéder à la plateforme sur tablette/mobile** afin de **consulter les résultats en déplacement** |
| **Priorité**         | Should Have                                                                                                                                            |
| **Story Points**     | 3                                                                                                                                                      |
| **Estimation Temps** | 16 heures                                                                                                                                              |
| **Dépendances**      | US-017 à US-020 (Toutes les interfaces)                                                                                                                |

#### **Critères d'Acceptation**

- Adaptation à toutes les tailles d'écran (320px à 1920px)
- Menu navigation adaptatif (hamburger menu mobile)
- Images et heatmaps redimensionnées correctement
- Touch-friendly (boutons ≥ 44px)
- Tests sur iOS et Android (navigateurs)
- Performance mobile optimisée

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                              | **Techno** | **Estimation** | **Statut** |
| ------------ | -------------------------------------------- | ---------- | -------------- | ---------- |
| **T-021.1**  | Audit responsive des pages existantes        | DevTools   | 2h             | ☐          |
| **T-021.2**  | Implémenter CSS Grid/Flexbox responsive      | CSS        | 4h             | ☐          |
| **T-021.3**  | Créer le menu hamburger mobile               | React/CSS  | 3h             | ☐          |
| **T-021.4**  | Adapter les tableaux et listes pour mobile   | CSS        | 3h             | ☐          |
| **T-021.5**  | Optimiser les images pour mobile (srcset)    | HTML/JS    | 2h             | ☐          |
| **T-021.6**  | Tester sur différents _devices_ (émulateurs) | Test       | 2h             | ☐          |

### US-022 : Notifications et alertes utilisateur

| **Champ**            | **Description**                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Notifications et alertes                                                                                                                 |
| **Description**      | En tant que **utilisateur**, je veux **recevoir des notifications** afin de **être informé des analyses terminées ou des cas critiques** |
| **Priorité**         | Could Have                                                                                                                               |
| **Story Points**     | 3                                                                                                                                        |
| **Estimation Temps** | 14 heures                                                                                                                                |
| **Dépendances**      | US-015 (Cas ambigus), US-018 (Résultats)                                                                                                 |

#### **Critères d'Acceptation**

- Notifications in-app (bell icon avec badge)
- Alertes pour les cas critiques (haute priorité)
- Historique des notifications consultable
- Marquer comme lu/non lu
- Option de désactivation des notifications
- Tests de tous les scénarios de notification

## Remarques relative à l'icône de la cloche (Visualisation) : L'affichage : Une icône de "cloche" doit être visible de manière permanente dans l'en-tête (header) de l'application. / Badge numérique : Un badge rouge (ou couleur contrastée) doit apparaître sur l'icône dès qu'une notification non lue est reçue. / Comportement du badge : \* Le badge doit afficher le nombre exact de notifications non lues. Si le nombre dépasse 9 ou 99 (selon le design), afficher 9+ ou 99+. Le badge disparaît si le compteur de notifications non lues tombe à zéro

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                               | **Techno** | **Estimation** | **Statut** |
| ------------ | --------------------------------------------- | ---------- | -------------- | ---------- |
| **T-022.1**  | Concevoir le modèle de données Notification   | SQLAlchemy | 2h             | ☐          |
| **T-022.2**  | Créer la migration de base de données         | Alembic    | 1h             | ☐          |
| **T-022.3**  | Développer l'endpoint GET/POST /notifications | FastAPI    | 3h             | ☐          |
| **T-022.4**  | Créer le composant bell icon avec badge       | React      | 3h             | ☐          |
| **T-022.5**  | Implémenter le système de lecture/non lecture | JS         | 2h             | ☐          |
| **T-022.6**  | Tester les différents types de notifications  | Test       | 2h             | ☐          |
| **T-022.7**  | Documenter (Chapitre 4.2.5)                   | LaTeX/Word | 1h             | ☐          |

### US-043 : Intégration continue des composants

| **Champ**            | **Description**                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Intégration continue des composants                                                                                                                        |
| **Description**      | En tant que **Développeur**, je veux **intégrer tous les composants (IA, API, Frontend)** afin de **garantir le fonctionnement cohérent de la plateforme** |
| **Priorité**         | Must Have                                                                                                                                                  |
| **Story Points**     | 8                                                                                                                                                          |
| **Estimation Temps** | 30 heures                                                                                                                                                  |
| **Dépendances**      | Toutes les US des Sprints 1-3                                                                                                                              |

#### **Critères d'Acceptation**

- Frontend connecté à l'API Backend
- API connectée au modèle IA
- Flux complet testé (Upload, Analyse, Résultat)
- Gestion des erreurs cohérente sur toute la chaîne
- Logs centralisés pour le débogage
- Documentation d'intégration (Chapitre 4.1)
- Tests d'intégration end-to-end

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                                                 | **Techno**       | **Estimation** | **Statut** |
| ------------ | ------------------------------------------------------------------------------- | ---------------- | -------------- | ---------- |
| **T-043.1**  | Configurer les variables d'environnement (dev/prod)                             | .env             | 2h             | ☐          |
| **T-043.2**  | Connecter Frontend à l'API (axios/fetch)                                        | React            | 4h             | ☐          |
| **T-043.3**  | Configurer **CORS<sup>[\[28\]](#footnote-28)</sup>** et sécurité des appels API | FastAPI          | 3h             | ☐          |
| **T-043.4**  | Intégrer le modèle IA dans le flux API                                          | Python           | 4h             | ☐          |
| **T-043.5**  | Tester le flux complet end-to-end                                               | Test             | 6h             | ☐          |
| **T-043.6**  | Implémenter la gestion d'erreurs globale                                        | Frontend/Backend | 4h             | ☐          |
| **T-043.7**  | Configurer les logs centralisés                                                 | Logging          | 3h             | ☐          |
| **T-043.8**  | Documenter l'architecture d'intégration (Chapitre 4)                            | LaTeX/Word       | 4h             | ☐          |

### Tableau des Tâches du Sprint

| **ID**    | **User Story** | **Tâche**                                      | **Techno** | **Est. (h)** | **Restant (h)** | **Statut** | **Assigné à** |
| --------- | -------------- | ---------------------------------------------- | ---------- | ------------ | --------------- | ---------- | ------------- |
| T-017.1   | US-017         | Concevoir maquette dashboard                   | Figma      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-017.2   | US-017         | Créer composant Dashboard                      | React      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-017.3   | US-017         | Endpoint GET /dashboard/stats                  | FastAPI    | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-017.4   | US-017         | Implémenter graphiques                         | Chart.js   | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-017.5   | US-017         | Liste analyses récentes                        | React      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-017.6   | US-017         | Optimiser chargement (cache)                   | Redis      | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-017.7   | US-017         | Tester responsive design                       | Test       | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.1   | US-018         | Concevoir page résultats                       | Figma      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.2   | US-018         | Composant ImageViewer avec zoom                | React      | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.3   | US-018         | Superposition heatmap/image                    | Canvas     | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.4   | US-018         | Endpoint GET /results/:id                      | FastAPI    | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.5   | US-018         | Afficher diagnostic et confiance               | React      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.6   | US-018         | Indicateur de sévérité                         | CSS/JS     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.7   | US-018         | Bouton export image annotée                    | JS         | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.8   | US-018         | Optimiser rendu images                         | React      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-018.9   | US-018         | Tests interface et performance                 | Test       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.1   | US-019         | Modèle AnalysisHistory                         | SQLAlchemy | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.2   | US-019         | Migration BDD<sup>[\[29\]](#footnote-29)</sup> | Alembic    | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.3   | US-019         | Endpoint GET /history avec filtres             | FastAPI    | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.4   | US-019         | Pagination serveur                             | FastAPI    | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.5   | US-019         | Composant frontend liste                       | React      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.6   | US-019         | Filtres et recherche                           | React      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.7   | US-019         | Export CSV                                     | Python/JS  | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.8   | US-019         | Tests performances grand volume                | Test       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-019.9   | US-019         | Documenter (Chapitre 4.2.3)                    | LaTeX      | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.1   | US-020         | Sélectionner librairie PDF                     | Recherche  | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.2   | US-020         | Concevoir template rapport                     | HTML/CSS   | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.3   | US-020         | Endpoint GET /report/:id/pdf                   | FastAPI    | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.4   | US-020         | Intégrer image et heatmap PDF                  | Python     | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.5   | US-020         | En-tête et pied de page                        | Python     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.6   | US-020         | Disclaimer médical obligatoire                 | Text       | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.7   | US-020         | Bouton téléchargement frontend                 | React      | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.8   | US-020         | Tester qualité PDF généré                      | Test       | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-020.9   | US-020         | Documenter (Chapitre 4.2.3)                    | LaTeX      | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-021.1   | US-021         | Audit responsive des pages                     | DevTools   | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-021.2   | US-021         | CSS Grid/Flexbox responsive                    | CSS        | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-021.3   | US-021         | Menu hamburger mobile                          | React/CSS  | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-021.4   | US-021         | Adapter tableaux et listes                     | CSS        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-021.5   | US-021         | Optimiser images mobile                        | HTML/JS    | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-021.6   | US-021         | Tester différents devices                      | Test       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-022.1   | US-022         | Modèle Notification                            | SQLAlchemy | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-022.2   | US-022         | Migration BDD                                  | Alembic    | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-022.3   | US-022         | Endpoint GET/POST /notifications               | FastAPI    | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-022.4   | US-022         | Composant bell icon avec badge                 | React      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-022.5   | US-022         | Système lecture/non lecture                    | JS         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-022.6   | US-022         | Tester scénarios notification                  | Test       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-022.7   | US-022         | Documenter (Chapitre 4.2.5)                    | LaTeX      | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-043.1   | US-043         | Variables d'environnement                      | .env       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-043.2   | US-043         | Connecter Frontend à API                       | React      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-043.3   | US-043         | Configurer CORS et sécurité                    | FastAPI    | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-043.4   | US-043         | Intégrer modèle IA dans flux API               | Python     | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-043.5   | US-043         | Tester flux end-to-end                         | Test       | 6            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-043.6   | US-043         | Gestion erreurs globale                        | Fullstack  | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-043.7   | US-043         | Logs centralisés                               | Logging    | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-043.8   | US-043         | Documenter architecture (Chapitre 4)           | LaTeX      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| **TOTAL** | &nbsp;         | &nbsp;                                         | &nbsp;     | **170h**     | &nbsp;          | &nbsp;     | &nbsp;        |

### Risk Log (Journal des Risques) - Sprint 4

| **ID**    | **Risque**                                  | **Impact** | **Probabilité** | **Mitigation**                                    | **Statut** |
| --------- | ------------------------------------------- | ---------- | --------------- | ------------------------------------------------- | ---------- |
| **R-019** | Problèmes d'intégration Frontend/Backend    | Élevé      | Élevée          | Tests d'intégration continus, API bien documentée | ☐ Ouvert   |
| **R-020** | Performance frontend lente (images lourdes) | Moyen      | Moyenne         | Lazy loading, compression images, cache           | ☐ Ouvert   |
| **R-021** | Incompatibilité navigateurs (mobile)        | Moyen      | Moyenne         | Tests multi-navigateurs, polyfills                | ☐ Ouvert   |
| **R-022** | Génération PDF trop lente                   | Moyen      | Faible          | Génération asynchrone, cache des PDF              | ☐ Ouvert   |
| **R-023** | Bugs d'affichage heatmap sur mobile         | Élevé      | Moyenne         | Tests responsive précoces, Canvas vs SVG          | ☐ Ouvert   |
| **R-024** | Délais d'intégration impactent Sprint 5     | Élevé      | Moyenne         | Prioriser les Must Have, reporter Could Have      | ☐ Ouvert   |
| **R-025** | Validation encadreur retardée               | Moyen      | Moyenne         | Rendez-vous fixe J5 et J10 du Sprint              | ☐ Ouvert   |

### Definition of Done

Pour qu'une tâche soit considérée comme **terminée** dans ce Sprint :

| **Critère**   | **Vérification**                                          |
| ------------- | --------------------------------------------------------- |
| Code          | Code développé, commité et pushé sur Git                  |
| Tests         | Tests unitaires et d'intégration passants                 |
| Review        | Code reviewé                                              |
| Documentation | Code commenté, README mis à jour, section mémoire rédigée |
| Intégration   | Composant intégré et fonctionnel dans la plateforme       |
| Démo          | Fonctionnalité démontrable localement                     |
| Mémoire       | Section correspondante du Chapitre 4 rédigée              |

# Sprint 5 Backlog - "Sécurité & RGPD"

Ce Sprint 5 constitue le volet critique de conformité et de protection des données de santé.

## 1\. Informations du Sprint

| **Information**                      | **Détail**                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nom du Sprint**                    | Sprint 5 - Sécurité & RGPD                                                                                                                       |
| **Durée**                            | 2 semaines                                                                                                                                       |
| **Date de début**                    | 13/04/2026                                                                                                                                       |
| **Date de fin**                      | 26/04/2026                                                                                                                                       |
| **Objectif du Sprint (Sprint Goal)** | Renforcer la sécurité de la plateforme, garantir la conformité RGPD des données de santé, et implémenter les mécanismes de protection et d'audit |
| **Capacity Totale**                  | 170 heures (équivalent 30 Story Points)                                                                                                          |
| **Dépendances Sprint 4**             | US-017 à US-022 (Plateforme intégrée), US-043 (Intégration)                                                                                      |
| **Dépendances Sprint 1**             | US-003 à US-005 (Authentification de base)                                                                                                       |
| **Dépendances Sprint 2**             | US-008 (Anonymisation DICOM (Digital Imaging and Communications in Medicine))                                                                    |

## 2\. User Stories Détaillées du Sprint 5

### US-023 : Chiffrement des données au repos (AES-256)

| **Champ**            | **Description**                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Chiffrement des données au repos                                                                                                                                           |
| **Description**      | En tant que **Responsable Sécurité**, je veux **chiffrer toutes les données stockées** afin de **protéger les informations sensibles en cas de compromission du stockage** |
| **Priorité**         | Must Have                                                                                                                                                                  |
| **Story Points**     | 8                                                                                                                                                                          |
| **Estimation Temps** | 30 heures                                                                                                                                                                  |
| **Dépendances**      | US-006 (Stockage images), US-008 (Anonymisation)                                                                                                                           |

#### **Critères d'Acceptation**

- Chiffrement AES-256 pour les images médicales stockées
- Chiffrement de la base de données (données patients, utilisateurs)
- Gestion sécurisée des clés de chiffrement (KMS ou vault)
- Déchiffrement transparent pour les utilisateurs autorisés
- Documentation du processus de chiffrement (Chapitre 6.2.4)
- Tests de récupération après chiffrement

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                    | **Techno**      | **Estimation** | **Statut** |
| ------------ | -------------------------------------------------- | --------------- | -------------- | ---------- |
| **T-023.1**  | Sélectionner l'algorithme de chiffrement (AES-256) | Recherche       | 2h             | ☐          |
| **T-023.2**  | Implémenter le chiffrement des fichiers images     | Python/Crypto   | 6h             | ☐          |
| **T-023.3**  | Configurer le chiffrement de la base de données    | PostgreSQL TDE  | 4h             | ☐          |
| **T-023.4**  | Mettre en place la gestion des clés (KMS/Vault)    | HashiCorp Vault | 5h             | ☐          |
| **T-023.5**  | Implémenter le déchiffrement à la demande          | Python          | 4h             | ☐          |
| **T-023.6**  | Tester la récupération des données chiffrées       | Test            | 4h             | ☐          |
| **T-023.7**  | Documenter le processus (Chapitre 6.2.4)           | LaTeX/Word      | 3h             | ☐          |
| **T-023.8**  | Audit de sécurité du chiffrement                   | Security Scan   | 2h             | ☐          |

### US-024 : Chiffrement des données en transit (HTTPS/TLS)

| **Champ**            | **Description**                                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Chiffrement des données en transit                                                                                                                          |
| **Description**      | En tant que **Responsable Sécurité**, je veux **chiffrer toutes les communications** afin de **protéger les données contre les attaques Man-in-the-Middle** |
| **Priorité**         | Must Have                                                                                                                                                   |
| **Story Points**     | 5                                                                                                                                                           |
| **Estimation Temps** | 20 heures                                                                                                                                                   |
| **Dépendances**      | US-043 (Intégration plateforme)                                                                                                                             |

#### **Critères d'Acceptation**

- HTTPS obligatoire pour toutes les communications
- Certificat TLS valide (Let's Encrypt ou CA)
- TLS 1.2 ou 1.3 uniquement (pas de SSL obsolète)
- HSTS (HTTP Strict Transport Security) activé
- Certificats de sécurité configurés correctement
- Documentation (Chapitre 6.1.3)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                        | **Techno**    | **Estimation** | **Statut** |
| ------------ | ------------------------------------------------------ | ------------- | -------------- | ---------- |
| **T-024.1**  | Obtenir un certificat SSL/TLS                          | Let's Encrypt | 2h             | ☐          |
| **T-024.2**  | Configurer HTTPS sur le serveur (Nginx/Apache)         | Nginx         | 4h             | ☐          |
| **T-024.3**  | Forcer la redirection HTTP vers HTTPS                  | Nginx         | 2h             | ☐          |
| **T-024.4**  | Configurer HSTS headers                                | Nginx         | 2h             | ☐          |
| **T-024.5**  | Désactiver les protocoles obsolètes (SSL, TLS 1.0/1.1) | Nginx         | 2h             | ☐          |
| **T-024.6**  | Tester la configuration (SSL Labs)                     | Online Tool   | 2h             | ☐          |
| **T-024.7**  | Documenter (Chapitre 6.1.3)                            | LaTeX/Word    | 3h             | ☐          |
| **T-024.8**  | Configurer les certificats pour les API internes       | mTLS          | 3h             | ☐          |

### US-025 : Gestion des consentements RGPD

| **Champ**            | **Description**                                                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Gestion des consentements RGPD                                                                                                                                                     |
| **Description**      | En tant que **DPO (Data Protection Officer)**, je veux **collecter et gérer les consentements utilisateurs** afin de **respecter les exigences du RGPD pour les données de santé** |
| **Priorité**         | Must Have                                                                                                                                                                          |
| **Story Points**     | 5                                                                                                                                                                                  |
| **Estimation Temps** | 22 heures                                                                                                                                                                          |
| **Dépendances**      | US-002 (Inscription), Chapitre 6.3                                                                                                                                                 |

#### **Critères d'Acceptation**

- Checkbox de consentement lors de l'inscription
- Consentement explicite pour le traitement des données de santé
- Possibilité de retirer le consentement à tout moment
- Historique des consentements stocké et auditable
- Langage clair et compréhensible (pas de jargon)
- Documentation RGPD (Chapitre 6.3.2)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                             | **Techno**       | **Estimation** | **Statut** |
| ------------ | ------------------------------------------- | ---------------- | -------------- | ---------- |
| **T-025.1**  | Concevoir le formulaire de consentement     | UX/Design        | 3h             | ☐          |
| **T-025.2**  | Créer le modèle de données Consentement     | SQLAlchemy       | 2h             | ☐          |
| **T-025.3**  | Implémenter la collecte à l'inscription     | Frontend/Backend | 4h             | ☐          |
| **T-025.4**  | Créer l'endpoint de retrait de consentement | FastAPI          | 3h             | ☐          |
| **T-025.5**  | Stocker l'historique des consentements      | BDD              | 2h             | ☐          |
| **T-025.6**  | Rédiger les textes de consentement (légal)  | Juridique        | 3h             | ☐          |
| **T-025.7**  | Tester le workflow complet                  | Test             | 3h             | ☐          |
| **T-025.8**  | Documenter (Chapitre 6.3.2)                 | LaTeX/Word       | 2h             | ☐          |

### US-026 : Droit à l'oubli (suppression des données)

| **Champ**            | **Description**                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Droit à l'oubli                                                                                                                                           |
| **Description**      | En tant que **patient/utilisateur**, je veux **pouvoir demander la suppression de mes données** afin de **exercer mon droit à l'oubli (RGPD Article 17)** |
| **Priorité**         | Must Have                                                                                                                                                 |
| **Story Points**     | 5                                                                                                                                                         |
| **Estimation Temps** | 24 heures                                                                                                                                                 |
| **Dépendances**      | US-025 (Consentements), US-019 (Historique)                                                                                                               |

#### **Critères d'Acceptation**

- Formulaire de demande de suppression accessible
- Suppression complète des données personnelles (BDD + fichiers)
- Conservation des logs d'audit (obligation légale)
- Confirmation de suppression envoyée à l'utilisateur
- Délai de traitement respecté (< 30 jours RGPD)
- Documentation (Chapitre 6.3.3)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                               | **Techno** | **Estimation** | **Statut** |
| ------------ | --------------------------------------------- | ---------- | -------------- | ---------- |
| **T-026.1**  | Concevoir le formulaire de demande            | Frontend   | 3h             | ☐          |
| **T-026.2**  | Créer l'endpoint DELETE /user/:id/data        | FastAPI    | 4h             | ☐          |
| **T-026.3**  | Implémenter la suppression en cascade (BDD)   | SQLAlchemy | 4h             | ☐          |
| **T-026.4**  | Supprimer les fichiers images associés        | Storage    | 3h             | ☐          |
| **T-026.5**  | Conserver les logs d'audit (exception légale) | Logging    | 2h             | ☐          |
| **T-026.6**  | Envoyer la confirmation de suppression        | Email      | 2h             | ☐          |
| **T-026.7**  | Tester la suppression complète                | Test       | 4h             | ☐          |
| **T-026.8**  | Documenter (Chapitre 6.3.3)                   | LaTeX/Word | 2h             | ☐          |

### US-027 : Audit logs de sécurité (Traçabilité)

| **Champ**            | **Description**                                                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Audit logs de sécurité                                                                                                                                                                    |
| **Description**      | En tant que **Administrateur Sécurité**, je veux **pouvoir tracer toutes les actions sensibles** afin de **détecter les accès non autorisés et assurer l'auditabilité (RGPD Article 30)** |
| **Priorité**         | Must Have                                                                                                                                                                                 |
| **Story Points**     | 5                                                                                                                                                                                         |
| **Estimation Temps** | 26 heures                                                                                                                                                                                 |
| **Dépendances**      | US-005 (Journalisation S1), US-008 (Anonymisation)                                                                                                                                        |

#### **Critères d'Acceptation**

- Logs de toutes les connexions (succès/échec)
- Logs de tous les accès aux données médicales
- Logs des modifications de données (création, update, delete)
- Logs exportables pour audit externe
- Protection des logs contre la modification (WORM)
- Documentation (Chapitre 6.2.5 & 6.2.6)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                                      | **Techno**   | **Estimation** | **Statut** |
| ------------ | ---------------------------------------------------- | ------------ | -------------- | ---------- |
| **T-027.1**  | Concevoir le modèle de données AuditLog étendu       | SQLAlchemy   | 3h             | ☐          |
| **T-027.2**  | Implémenter le logging pour tous les endpoints       | FastAPI      | 5h             | ☐          |
| **T-027.3**  | Capturer les métadonnées (IP, user-agent, timestamp) | Python       | 3h             | ☐          |
| **T-027.4**  | Stocker les logs de manière immuable                 | WORM Storage | 4h             | ☐          |
| **T-027.5**  | Créer l'interface de consultation des logs (admin)   | React        | 4h             | ☐          |
| **T-027.6**  | Implémenter l'export des logs (CSV/JSON)             | Python       | 3h             | ☐          |
| **T-027.7**  | Tester l'intégrité des logs                          | Test         | 2h             | ☐          |
| **T-027.8**  | Documenter (Chapitre 6.2.5 & 6.2.6)                  | LaTeX/Word   | 2h             | ☐          |

### US-028 : Tests de pénétration (Pentest) et vulnérabilités

| **Champ**            | **Description**                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Tests de pénétration                                                                                                                                      |
| **Description**      | En tant que **Responsable Sécurité**, je veux **réaliser des tests d'intrusion** afin de **détecter et corriger les vulnérabilités avant le déploiement** |
| **Priorité**         | Should Have                                                                                                                                               |
| **Story Points**     | 8                                                                                                                                                         |
| **Estimation Temps** | 28 heures                                                                                                                                                 |
| **Dépendances**      | US-023 à US-027 (Toutes les sécurités)                                                                                                                    |

#### **Critères d'Acceptation**

- Scan de vulnérabilités automatisé (SAST/DAST)
- Tests d'intrusion manuels sur les endpoints critiques
- Rapport de sécurité généré avec sévérité des vulnérabilités
- Correction des vulnérabilités critiques et majeures
- Re-test après correction
- Documentation (Chapitre 6.1.5)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                           | **Techno** | **Estimation** | **Statut** |
| ------------ | ----------------------------------------- | ---------- | -------------- | ---------- |
| **T-028.1**  | Configurer les outils de scan SAST        | SonarQube  | 3h             | ☐          |
| **T-028.2**  | Configurer les outils de scan DAST        | OWASP ZAP  | 4h             | ☐          |
| **T-028.3**  | Réaliser les tests d'intrusion manuels    | Manual     | 6h             | ☐          |
| **T-028.4**  | Tester les injections SQL                 | SQLMap     | 3h             | ☐          |
| **T-028.5**  | Tester les failles XSS et CSRF            | Manual     | 3h             | ☐          |
| **T-028.6**  | Tester l'authentification et autorisation | Manual     | 3h             | ☐          |
| **T-028.7**  | Générer le rapport de sécurité            | Report     | 3h             | ☐          |
| **T-028.8**  | Corriger les vulnérabilités critiques     | Dev        | 3h             | ☐          |
| **T-028.9**  | Documenter (Chapitre 6.1.5)               | LaTeX/Word | 2h             | ☐          |

### US-044 : Analyse des menaces (STRIDE<sup>[\[30\]](#footnote-30)</sup>)

| **Champ**            | **Description**                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Titre**            | Analyse des menaces                                                                                                                                                    |
| **Description**      | En tant que **Architecte Sécurité**, je veux **réaliser une analyse des menaces** afin de **identifier les risques et mettre en place les contre-mesures appropriées** |
| **Priorité**         | Must Have                                                                                                                                                              |
| **Story Points**     | 5                                                                                                                                                                      |
| **Estimation Temps** | 20 heures                                                                                                                                                              |
| **Dépendances**      | Chapitre 6.1.1                                                                                                                                                         |

#### **Critères d'Acceptation**

- Analyse STRIDE complète (Spoofing, Tampering, Repudiation, etc ).
- Diagramme de flux de données sécurisé
- Matrice des risques avec niveau de sévérité
- Contre-mesures documentées pour chaque menace
- Validation avec l'encadreur
- Documentation (Chapitre 6.1.1)

#### **Tâches Techniques Associées**

| **ID Tâche** | **Description**                              | **Techno** | **Estimation** | **Statut** |
| ------------ | -------------------------------------------- | ---------- | -------------- | ---------- |
| **T-044.1**  | Étudier la méthodologie STRIDE               | Recherche  | 2h             | ☐          |
| **T-044.2**  | Créer le diagramme de flux de données        | Draw.io    | 3h             | ☐          |
| **T-044.3**  | Identifier les menaces par catégorie STRIDE  | Analysis   | 5h             | ☐          |
| **T-044.4**  | Évaluer la sévérité de chaque menace (DREAD) | Analysis   | 3h             | ☐          |
| **T-044.5**  | Définir les contre-mesures                   | Security   | 4h             | ☐          |
| **T-044.6**  | Créer la matrice des risques                 | Excel/Doc  | 2h             | ☐          |
| **T-044.7**  | Valider avec l'encadreur                     | Réunion    | 1h             | ☐          |

### Tableau des Tâches du Sprint

| **ID**    | **User Story** | **Tâche**                            | **Techno**    | **Est. (h)** | **Restant (h)** | **Statut** | **Assigné à** |
| --------- | -------------- | ------------------------------------ | ------------- | ------------ | --------------- | ---------- | ------------- |
| T-023.1   | US-023         | Sélectionner algorithme chiffrement  | Recherche     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-023.2   | US-023         | Chiffrement fichiers images          | Python/Crypto | 6            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-023.3   | US-023         | Chiffrement base de données          | PostgreSQL    | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-023.4   | US-023         | Gestion des clés (KMS/Vault)         | HashiCorp     | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-023.5   | US-023         | Déchiffrement à la demande           | Python        | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-023.6   | US-023         | Tester récupération données          | Test          | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-023.7   | US-023         | Documenter (Chapitre 6.2.4)          | LaTeX         | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-023.8   | US-023         | Audit sécurité chiffrement           | Security      | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-024.1   | US-024         | Obtenir certificat SSL/TLS           | Let's Encrypt | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-024.2   | US-024         | Configurer HTTPS (Nginx)             | Nginx         | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-024.3   | US-024         | Redirection HTTP vers HTTPS          | Nginx         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-024.4   | US-024         | Configurer HSTS headers              | Nginx         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-024.5   | US-024         | Désactiver protocoles obsolètes      | Nginx         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-024.6   | US-024         | Tester configuration (SSL Labs)      | Online        | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-024.7   | US-024         | Documenter (Chapitre 6.1.3)          | LaTeX         | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-024.8   | US-024         | Certificats API internes             | mTLS          | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-025.1   | US-025         | Concevoir formulaire consentement    | UX/Design     | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-025.2   | US-025         | Modèle de données Consentement       | SQLAlchemy    | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-025.3   | US-025         | Collecte à l'inscription             | Fullstack     | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-025.4   | US-025         | Endpoint retrait consentement        | FastAPI       | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-025.5   | US-025         | Historique des consentements         | BDD           | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-025.6   | US-025         | Rédiger textes de consentement       | Juridique     | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-025.7   | US-025         | Tester workflow complet              | Test          | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-025.8   | US-025         | Documenter (Chapitre 6.3.2)          | LaTeX         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-026.1   | US-026         | Formulaire demande suppression       | Frontend      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-026.2   | US-026         | Endpoint DELETE /user/:id/data       | FastAPI       | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-026.3   | US-026         | Suppression en cascade (BDD)         | SQLAlchemy    | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-026.4   | US-026         | Supprimer fichiers images            | Storage       | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-026.5   | US-026         | Conserver logs d'audit               | Logging       | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-026.6   | US-026         | Confirmation suppression (email)     | Email         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-026.7   | US-026         | Tester suppression complète          | Test          | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-026.8   | US-026         | Documenter (Chapitre 6.3.3)          | LaTeX         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-027.1   | US-027         | Modèle AuditLog étendu               | SQLAlchemy    | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-027.2   | US-027         | Logging tous les endpoints           | FastAPI       | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-027.3   | US-027         | Capturer métadonnées                 | Python        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-027.4   | US-027         | Stockage logs immuable               | WORM          | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-027.5   | US-027         | Interface consultation logs (admin)  | React         | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-027.6   | US-027         | Export des logs (CSV/JSON)           | Python        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-027.7   | US-027         | Tester intégrité des logs            | Test          | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-027.8   | US-027         | Documenter (Chapitre 6.2.5)          | LaTeX         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.1   | US-028         | Configurer scan SAST                 | SonarQube     | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.2   | US-028         | Configurer scan DAST                 | OWASP ZAP     | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.3   | US-028         | Tests intrusion manuels              | Manual        | 6            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.4   | US-028         | Tester injections SQL                | SQLMap        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.5   | US-028         | Tester failles XSS/CSRF              | Manual        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.6   | US-028         | Tester authentification/autorisation | Manual        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.7   | US-028         | Générer rapport sécurité             | Report        | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.8   | US-028         | Corriger vulnérabilités critiques    | Dev           | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-028.9   | US-028         | Documenter (Chapitre 6.1.5)          | LaTeX         | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-044.1   | US-044         | Étudier méthodologie STRIDE          | Recherche     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-044.2   | US-044         | Diagramme flux de données            | Draw.io       | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-044.3   | US-044         | Identifier menaces STRIDE            | Analysis      | 5            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-044.4   | US-044         | Évaluer sévérité (DREAD)             | Analysis      | 3            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-044.5   | US-044         | Définir contre-mesures               | Security      | 4            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-044.6   | US-044         | Matrice des risques                  | Excel/Doc     | 2            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| T-044.7   | US-044         | Valider avec encadreur               | Réunion       | 1            | &nbsp;          | ☐ À Faire  | &nbsp;        |
| **TOTAL** | &nbsp;         | &nbsp;                               | &nbsp;        | **170h**     | &nbsp;          | &nbsp;     | &nbsp;        |

### Risk Log (Journal des Risques) - Sprint 5

| **ID**    | **Risque**                                | **Impact** | **Probabilité** | **Mitigation**                                  | **Statut** |
| --------- | ----------------------------------------- | ---------- | --------------- | ----------------------------------------------- | ---------- |
| **R-026** | Complexité du chiffrement AES-256         | Élevé      | Moyenne         | Utiliser librairies éprouvées (cryptography.io) | ☐ Ouvert   |
| **R-027** | Perte des clés de chiffrement             | Critique   | Faible          | Backup sécurisé des clés, KMS                   | ☐ Ouvert   |
| **R-028** | Non-conformité RGPD détectée tardivement  | Élevé      | Moyenne         | Audit RGPD précoce, validation juridique        | ☐ Ouvert   |
| **R-029** | Vulnérabilités critiques non corrigeables | Élevé      | Faible          | Refactorisation, contournements sécurité        | ☐ Ouvert   |
| **R-030** | Performance impactée par le chiffrement   | Moyen      | Moyenne         | Optimisation, chiffrement asynchrone            | ☐ Ouvert   |
| **R-031** | Logs trop volumineux (stockage)           | Moyen      | Moyenne         | Rotation des logs, archivage automatique        | ☐ Ouvert   |
| **R-032** | Délais de validation encadreur            | Moyen      | Moyenne         | Rendez-vous fixe J5 et J10 du Sprint            | ☐ Ouvert   |
| **R-033** | Complexité juridique RGPD                 | Élevé      | Moyenne         | Consulter ressources CNIL, modèles standards    | ☐ Ouvert   |

### Definition of Done

Pour qu'une tâche soit considérée comme **terminée** dans ce Sprint :

| **Critère**   | **Vérification**                                    |
| ------------- | --------------------------------------------------- |
| Code          | Code développé, commité et pushé sur Git            |
| Tests         | Tests de sécurité passants (SAST/DAST)              |
| Review        | Code reviewé                                        |
| Documentation | Code commenté, README mis à jour, Chapitre 6 rédigé |
| Sécurité      | Pas de vulnérabilités critiques, chiffrement validé |
| RGPD          | Conformité vérifiée avec checklist RGPD             |
| Démo          | Fonctionnalité démontrable localement               |
| Mémoire       | Section correspondante du Chapitre 6 rédigée        |

# Matrice de Traçabilité des Exigences (Requirements Traceability Matrix)

Cette matrice relie toutes les **User Stories** des 6 Sprints aux différentes **Exigences**

## Légende des ID Exigence

| **Préfixe**        | **Catégorie**                | **Référence Chapitre** |
| ------------------ | ---------------------------- | ---------------------- |
| **REQ-FUNC-XXX**   | Exigences Fonctionnelles     | Chapitre 3.2           |
| **REQ-NFR-XXX**    | Exigences Non-Fonctionnelles | Chapitre 3.3           |
| **REQ-SEC-XXX**    | Exigences de Sécurité        | Chapitre 6.1 & 6.2     |
| **REQ-RGPD-XXX**   | Exigences RGPD               | Chapitre 6.3           |
| **REQ-IA-XXX**     | Exigences IA / Deep Learning | Chapitre 2.3 & 8.2     |
| **REQ-DEVOPS-XXX** | Exigences DevOps             | Chapitre 7             |
| **REQ-TEST-XXX**   | Exigences de Tests           | Chapitre 8.1           |

**Les critères de qualité des exigences selon le modèle « _INVEST_ » :**

- **I**ndépendante : Chaque exigence peut être développée isolément
- **N**égociable : Ouverte à la discussion avec les stakeholders
- **V**alorisable : Apporte une valeur métier mesurable
- **E**stimable : Peut être estimée en effort/temps
- **S**mall : Suffisamment petite pour un Sprint
- **T**estable : Possède des critères d'acceptation clairs

## Matrice Complète de Traçabilité

| **User Story** | **ID Exigence** | **Description**                                                                  | **Tâches Techniques**     | **Tests Associés**                         | **Statut** |
| -------------- | --------------- | -------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------ | ---------- |
| **US-001**     | REQ-DEVOPS-001  | Initialiser l'environnement de développement                                     | T-001.1 à T-001.7         | T-001.7 (Test environnement)               | ☐          |
| **US-002**     | REQ-FUNC-001    | Inscription des utilisateurs                                                     | T-002.1 à T-002.8         | T-002.8 (Tests unitaires)                  | ☐          |
| **US-002**     | REQ-SEC-001     | Hachage sécurisé des mots de passe                                               | T-002.4 (bcrypt)          | T-002.8 (Tests sécurité)                   | ☐          |
| **US-003**     | REQ-FUNC-002    | Connexion sécurisée des utilisateurs                                             | T-003.1 à T-003.8         | T-003.8 (Tests intégration)                | ☐          |
| **US-003**     | REQ-SEC-002     | Authentification par JWT                                                         | T-003.2, T-003.3          | T-003.8 (Tests auth)                       | ☐          |
| **US-004**     | REQ-SEC-003     | Journalisation des connexions (Audit)                                            | T-004.1 à T-004.7         | T-004.7 (Tests journalisation)             | ☐          |
| **US-004**     | REQ-RGPD-001    | Traçabilité des accès (RGPD Art. 30)                                             | T-004.3, T-004.6          | T-004.7 (Audit logs)                       | ☐          |
| **US-005**     | REQ-FUNC-003    | Documentation des spécifications                                                 | T-005.1 à T-005.5         | T-005.5 (Validation encadreur)             | ☐          |
| **US-006**     | REQ-FUNC-004    | Upload d'images médicales (DICOM, PNG, JPG)                                      | T-006.1 à T-006.8         | T-006.8 (Tests upload)                     | ☐          |
| **US-006**     | REQ-SEC-004     | Chiffrement des fichiers stockés                                                 | T-006.8 (AES-256)         | T-006.8 (Tests crypto)                     | ☐          |
| **US-007**     | REQ-FUNC-005    | Validation des fichiers médicaux                                                 | T-007.1 à T-007.7         | T-007.7 (Tests validation)                 | ☐          |
| **US-007**     | REQ-IA-001      | Intégrité des données d'entrée IA                                                | T-007.2, T-007.4          | T-007.7 (Tests intégrité)                  | ☐          |
| **US-008**     | REQ-RGPD-002    | Anonymisation automatique DICOM (Digital Imaging and Communications in Medicine) | T-008.1 à T-008.9         | T-008.7 (Tests anonymisation)              | ☐          |
| **US-008**     | REQ-SEC-005     | Protection des données patients                                                  | T-008.3, T-008.4          | T-008.7 (Tests RGPD)                       | ☐          |
| **US-009**     | REQ-IA-002      | Prétraitement des images pour IA                                                 | T-009.1 à T-009.8         | T-009.6 (Tests pipeline)                   | ☐          |
| **US-009**     | REQ-NFR-001     | Normalisation uniforme des images                                                | T-009.2, T-009.3          | T-009.6 (Tests qualité)                    | ☐          |
| **US-010**     | REQ-FUNC-006    | Gestion des erreurs d'upload                                                     | T-010.1 à T-010.6         | T-010.5 (Tests erreurs)                    | ☐          |
| **US-010**     | REQ-NFR-002     | Messages d'erreur utilisateur clairs                                             | T-010.2, T-010.6          | T-010.5 (Tests UX)                         | ☐          |
| **US-011**     | REQ-IA-003      | Intégration du modèle de classification                                          | T-011.1 à T-011.9         | T-011.7 (Tests inférence)                  | ☐          |
| **US-011**     | REQ-NFR-003     | Temps d'inférence < 5 secondes                                                   | T-011.6 (Optimisation)    | T-011.7 (Tests performance)                | ☐          |
| **US-012**     | REQ-IA-004      | Entraînement du modèle pulmonaire                                                | T-012.1 à T-012.12        | T-012.11 (MLflow tracking)                 | ☐          |
| **US-012**     | REQ-IA-005      | Split dataset (train/val/test)                                                   | T-012.1, T-012.2          | T-012.11 (Validation croisée)              | ☐          |
| **US-013**     | REQ-IA-006      | Génération de Heatmaps (Grad-CAM)                                                | T-013.1 à T-013.9         | T-013.7 (Tests cohérence)                  | ☐          |
| **US-013**     | REQ-NFR-004     | Explicabilité des décisions IA                                                   | T-013.2, T-013.8          | T-013.7 (Tests XAI)                        | ☐          |
| **US-014**     | REQ-IA-007      | Score de confiance du diagnostic                                                 | T-014.1 à T-014.7         | T-014.6 (Tests confiance)                  | ☐          |
| **US-014**     | REQ-NFR-005     | Affichage pourcentage de confiance                                               | T-014.2, T-014.5          | T-014.6 (Tests affichage)                  | ☐          |
| **US-015**     | REQ-FUNC-007    | Gestion des cas ambigus (faible confiance)                                       | T-015.1 à T-015.8         | T-015.7 (Tests workflow)                   | ☐          |
| **US-015**     | REQ-IA-008      | Signalisation pour revue humaine                                                 | T-015.4, T-015.5          | T-015.7 (Tests alertes)                    | ☐          |
| **US-016**     | REQ-NFR-006     | Optimisation des performances d'inférence                                        | T-016.1 à T-016.8         | T-016.7 (Tests de charge)                  | ☐          |
| **US-016**     | REQ-NFR-007     | Support GPU/CUDA pour l'IA                                                       | T-016.2, T-016.3          | T-016.7 (Benchmarks)                       | ☐          |
| **US-017**     | REQ-FUNC-008    | Dashboard principal (vue d'ensemble)                                             | T-017.1 à T-017.7         | T-017.7 (Tests responsive)                 | ☐          |
| **US-017**     | REQ-NFR-008     | Temps de chargement < 2 secondes                                                 | T-017.6 (Cache Redis)     | T-017.7 (Tests performance)                | ☐          |
| **US-018**     | REQ-FUNC-009    | Visualisation des résultats d'analyse                                            | T-018.1 à T-018.9         | T-018.9 (Tests interface)                  | ☐          |
| **US-018**     | REQ-IA-009      | Superposition heatmap/image originale                                            | T-018.3, T-018.7          | T-018.9 (Tests visuels)                    | ☐          |
| **US-019**     | REQ-FUNC-010    | Historique des analyses                                                          | T-019.1 à T-019.9         | T-019.8 (Tests volume)                     | ☐          |
| **US-019**     | REQ-FUNC-011    | Filtres et recherche dans l'historique                                           | T-019.3, T-019.6          | T-019.8 (Tests filtres)                    | ☐          |
| **US-020**     | REQ-FUNC-012    | Génération de rapport PDF                                                        | T-020.1 à T-020.9         | T-020.8 (Tests qualité PDF)                | ☐          |
| **US-020**     | REQ-NFR-009     | Format A4 standard avec mentions légales                                         | T-020.5, T-020.6          | T-020.8 (Tests conformité)                 | ☐          |
| **US-021**     | REQ-NFR-010     | Interface responsive (Desktop/Mobile)                                            | T-021.1 à T-021.6         | T-021.6 (Tests devices)                    | ☐          |
| **US-021**     | REQ-NFR-011     | Adaptation 320px à 1920px                                                        | T-021.2, T-021.4          | T-021.6 (Tests responsive)                 | ☐          |
| **US-022**     | REQ-FUNC-013    | Notifications et alertes utilisateur                                             | T-022.1 à T-022.7         | T-022.6 (Tests notifications)              | ☐          |
| **US-022**     | REQ-NFR-012     | Notification temps réel des cas critiques                                        | T-022.3, T-022.5          | T-022.6 (Tests alertes)                    | ☐          |
| **US-023**     | REQ-SEC-006     | Chiffrement des données au repos (AES-256)                                       | T-023.1 à T-023.8         | T-023.8 (Audit sécurité)                   | ☐          |
| **US-023**     | REQ-SEC-007     | Gestion sécurisée des clés de chiffrement                                        | T-023.4 (KMS/Vault)       | T-023.6 (Tests récupération)               | ☐          |
| **US-024**     | REQ-SEC-008     | Chiffrement des données en transit (HTTPS/TLS)                                   | T-024.1 à T-024.8         | T-024.6 (SSL Labs test)                    | ☐          |
| **US-024**     | REQ-SEC-009     | TLS 1.2/1.3 obligatoire, HSTS activé                                             | T-024.4, T-024.5          | T-024.6 (Tests config)                     | ☐          |
| **US-025**     | REQ-RGPD-003    | Gestion des consentements utilisateurs                                           | T-025.1 à T-025.8         | T-025.7 (Tests workflow)                   | ☐          |
| **US-025**     | REQ-RGPD-004    | Consentement explicite données de santé                                          | T-025.3, T-025.6          | T-025.7 (Tests légaux)                     | ☐          |
| **US-026**     | REQ-RGPD-005    | Droit à l'oubli (suppression données)                                            | T-026.1 à T-026.8         | T-026.7 (Tests suppression)                | ☐          |
| **US-026**     | REQ-RGPD-006    | Conservation des logs d'audit (exception légale)                                 | T-026.5                   | T-026.7 (Tests intégrité)                  | ☐          |
| **US-027**     | REQ-SEC-010     | Audit logs de sécurité (traçabilité)                                             | T-027.1 à T-027.8         | T-027.7 (Tests intégrité)                  | ☐          |
| **US-027**     | REQ-RGPD-007    | Logs exportables pour audit externe                                              | T-027.4, T-027.6          | T-027.7 (Tests export)                     | ☐          |
| **US-028**     | REQ-SEC-011     | Tests de pénétration (Pentest)                                                   | T-028.1 à T-028.9         | T-028.7 (Rapport sécurité)                 | ☐          |
| **US-028**     | REQ-SEC-012     | Correction des vulnérabilités critiques                                          | T-028.8                   | T-028.7 (Re-test)                          | ☐          |
| **US-029**     | REQ-DEVOPS-002  | Conteneurisation Docker de la plateforme                                         | T-029.1 à T-029.7         | T-029.6 (Tests conteneurs)                 | ☐          |
| **US-029**     | REQ-DEVOPS-003  | Images optimisées (multi-stage build)                                            | T-029.5                   | T-029.6 (Tests démarrage)                  | ☐          |
| **US-030**     | REQ-DEVOPS-004  | Pipeline CI/CD (GitHub Actions)                                                  | T-030.1 à T-030.9         | T-030.7 (Tests pipeline)                   | ☐          |
| **US-030**     | REQ-DEVOPS-005  | Tests automatiques à chaque commit                                               | T-030.4, T-030.5          | T-030.7 (Tests CI)                         | ☐          |
| **US-031**     | REQ-DEVOPS-006  | Déploiement automatisé (Dev/Test/Prod)                                           | T-031.1 à T-031.7         | T-031.6 (Tests déploiement)                | ☐          |
| **US-031**     | REQ-DEVOPS-007  | Gestion des variables d'environnement sécurisée                                  | T-031.5 (Vault/.env)      | T-031.6 (Tests secrets)                    | ☐          |
| **US-032**     | REQ-DEVOPS-008  | Monitoring (Prometheus/Grafana)                                                  | T-032.1 à T-032.7         | T-032.6 (Tests métriques)                  | ☐          |
| **US-032**     | REQ-NFR-013     | Alertes configurées pour seuils critiques                                        | T-032.5 (Alertmanager)    | T-032.6 (Tests alertes)                    | ☐          |
| **US-033**     | REQ-DEVOPS-009  | Gestion des logs centralisés (ELK/Loki)                                          | T-033.1 à T-033.7         | T-033.7 (Tests logs)                       | ☐          |
| **US-033**     | REQ-SEC-013     | Accès sécurisé aux logs (authentification)                                       | T-033.6                   | T-033.7 (Tests auth)                       | ☐          |
| **US-034**     | REQ-DEVOPS-010  | Plan de rollback (gestion des incidents)                                         | T-034.1 à T-034.6         | T-034.4 (Tests rollback)                   | ☐          |
| **US-034**     | REQ-DEVOPS-011  | Versionning sémantique des images Docker                                         | T-034.2, T-034.3          | T-034.4 (Tests version)                    | ☐          |
| **US-035**     | REQ-TEST-001    | Tests unitaires Backend (couverture > 80%)                                       | T-035.1 à T-035.7         | T-035.5 (Rapport coverage)                 | ☐          |
| **US-035**     | REQ-TEST-002    | Tests pour tous les endpoints API                                                | T-035.2, T-035.6          | T-035.5 (Tests unitaires)                  | ☐          |
| **US-036**     | REQ-TEST-003    | Tests d'intégration API                                                          | T-036.1 à T-036.7         | T-036.6 (Rapport tests)                    | ☐          |
| **US-036**     | REQ-TEST-004    | Tests des flux complets (Upload → Analyse → Résultat)                            | T-036.2, T-036.3          | T-036.6 (Tests E2E)                        | ☐          |
| **US-037**     | REQ-TEST-005    | Tests de performance (Load Testing)                                              | T-037.1 à T-037.7         | T-037.6 (Rapport performance)              | ☐          |
| **US-037**     | REQ-NFR-014     | Simulation de 100 utilisateurs simultanés                                        | T-037.3 (Locust)          | T-037.6 (Benchmarks)                       | ☐          |
| **US-038**     | REQ-TEST-006    | Tests utilisateurs (UX)                                                          | T-038.1 à T-038.7         | T-038.5 (Analyse feedback)                 | ☐          |
| **US-038**     | REQ-NFR-015     | 5 utilisateurs testeurs minimum                                                  | T-038.1, T-038.4          | T-038.5 (Questionnaires)                   | ☐          |
| **US-039**     | REQ-IA-010      | Validation scientifique finale du modèle                                         | T-039.1 à T-039.8         | T-039.8 (Validation encadreur)             | ☐          |
| **US-039**     | REQ-IA-011      | Métriques finales (Accuracy, Precision, Recall, F1, AUC)                         | T-039.2, T-039.3, T-039.4 | T-039.8 (Rapport scientifique)             | ☐          |
| **US-040**     | REQ-DEVOPS-012  | Documentation technique finale                                                   | T-040.1 à T-040.6         | T-040.6 (Code review)                      | ☐          |
| **US-040**     | REQ-NFR-016     | README, API Docs, Guides de déploiement                                          | T-040.2, T-040.3, T-040.4 | T-040.6 (Validation docs)                  | ☐          |
| **US-041**     | REQ-IA-012      | Collecte et préparation des datasets publics                                     | T-041.1 à T-041.7         | T-041.4 (Tests intégrité)                  | ☐          |
| **US-041**     | REQ-IA-013      | Organisation train/val/test et statistiques                                      | T-041.3, T-041.6          | T-041.4 (Validation dataset)               | ☐          |
| **US-042**     | REQ-IA-014      | Évaluation scientifique du modèle (Métriques)                                    | T-042.1 à T-042.8         | T-042.8 (Validation encadreur)             | ☐          |
| **US-042**     | REQ-IA-015      | Comparaison avec l'état de l'art                                                 | T-042.5, T-042.7          | T-042.8 (Benchmark)                        | ☐          |
| **US-043**     | REQ-FUNC-014    | Intégration continue des composants                                              | T-043.1 à T-043.8         | T-043.5 (Tests E2E)                        | ☐          |
| **US-043**     | REQ-NFR-017     | Flux complet testé (Upload → Analyse → Résultat)                                 | T-043.4, T-043.5          | T-043.5 (Tests intégration)                | ☐          |
| **US-044**     | REQ-SEC-014     | Analyse des menaces (STRIDE)                                                     | T-044.1 à T-044.7         | T-044.7 (Validation encadreur)             | ☐          |
| **US-044**     | REQ-SEC-015     | Matrice des risques avec contre-mesures                                          | T-044.4, T-044.5, T-044.6 | T-044.7 (Audit sécurité)                   | ☐          |
| **US-045**     | REQ-DOC-001     | Finalisation du mémoire et préparation soutenance                                | T-045.1 à T-045.9         | T-045.7, T-045.9 (Validation + Répétition) | ☐          |
| **US-045**     | REQ-DOC-002     | Tous les chapitres (1-9) rédigés et validés                                      | T-045.3, T-045.4, T-045.5 | T-045.7 (Validation encadreur)             | ☐          |

## Statistiques de la Matrice

| **Métrique**                            | **Valeur** |
| --------------------------------------- | ---------- |
| Nombre total de User Stories            | 45         |
| Nombre total d'Exigences tracées        | 67         |
| Exigences Fonctionnelles (REQ-FUNC)     | 14         |
| Exigences Non-Fonctionnelles (REQ-NFR)  | 17         |
| Exigences de Sécurité (REQ-SEC)         | 15         |
| Exigences RGPD (REQ-RGPD)               | 7          |
| Exigences IA (REQ-IA)                   | 15         |
| Exigences DevOps (REQ-DEVOPS)           | 12         |
| Exigences de Tests (REQ-TEST)           | 6          |
| Exigences Documentation (REQ-DOC)       | 2          |
| Taux de couverture des US par exigences | 100%       |

- **ÉPIC :** Une Epic en Agile est une grande fonctionnalité ou un objectif stratégique de haut niveau, trop volumineux pour être réalisé en un seul sprint. Elle regroupe plusieurs User Stories (histoires utilisateurs) liées et nécessite généralement plusieurs itérations pour être finalisée, agissant comme un chapitre dans la Roadmap produit. Elle se décompose en sous-tâches plus petites et gérables (User Stories) et elle s'étale souvent sur plusieurs semaines, voire mois. Son rôle est d'aider organiser le _backlog_ en regroupant des fonctionnalités cohérentes.

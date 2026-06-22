# TaskFlow API

![Pipeline](https://img.shields.io/badge/CI%2FCD-Jenkins-blue)
![Node](https://img.shields.io/badge/Node.js-18-green)
![Docker](https://img.shields.io/badge/Docker-Compose-informational)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Lint](https://img.shields.io/badge/ESLint-passing-success)

REST API de gestion de tâches, industrialisée avec Jenkins CI/CD, Docker et Nginx.

---

## Description

**TaskFlow API** est une API REST construite avec **Node.js + Express** et **MongoDB**. Elle expose des routes CRUD pour gérer des tâches (`todo`, `in-progress`, `done`). L'ensemble de l'infrastructure est conteneurisée avec Docker Compose et automatisée via un pipeline Jenkins déclaratif en 7 stages (6 obligatoires + 1 stage bonus de notification).

---

## Prérequis

- [Docker](https://www.docker.com/) **&** Docker Compose v2
- [Git](https://git-scm.com/)
- Jenkins LTS — **inclus** comme service dans le `docker-compose.yml` (accessible sur le port `8080`)

> Aucune installation locale de Node.js ou MongoDB n'est nécessaire : tout tourne dans des conteneurs.

---

## Démarrage rapide

```bash
git clone https://github.com/Mieru-yo/TaskFlow-API.git
cd TaskFlow-API
docker compose up -d
```

- L'API est disponible via Nginx sur **http://localhost/api/tasks**
- Jenkins est disponible sur **http://localhost:8080**

> Le projet démarre **sans intervention** : les variables d'environnement ont des valeurs par défaut sûres. Pour personnaliser, copiez `.env.example` vers `.env` et adaptez les valeurs.

```bash
cp .env.example .env   # optionnel — renseigner MONGO_URI et PORT
```

---

## Variables d'environnement

| Variable    | Description                        | Exemple                                  |
|-------------|------------------------------------|------------------------------------------|
| `MONGO_URI` | URI de connexion MongoDB           | `mongodb://mongodb:27017/taskflow`       |
| `PORT`      | Port d'écoute de l'API             | `5000`                                   |
| `NODE_ENV`  | Environnement d'exécution          | `production`                             |

> ⚠️ Le fichier `.env` est listé dans `.gitignore` et **n'est jamais versionné**. Seul `.env.example` (sans secret) est présent dans le repo.

---

## Endpoints REST

| Méthode | Route              | Description                                |
|---------|--------------------|--------------------------------------------|
| GET     | `/health`          | Health check (`{status, uptime, version}`) |
| GET     | `/api/tasks`       | Liste toutes les tâches                    |
| POST    | `/api/tasks`       | Crée une tâche                             |
| GET     | `/api/tasks/:id`   | Retourne une tâche par son id              |
| PUT     | `/api/tasks/:id`   | Met à jour une tâche                       |
| DELETE  | `/api/tasks/:id`   | Supprime une tâche                         |

### Exemple

```bash
# Créer une tâche
curl -X POST http://localhost/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Première tâche","description":"Test","status":"todo"}'

# Lister les tâches
curl http://localhost/api/tasks
```

### Modèle de données — `Task`

| Champ         | Type   | Contraintes                                          |
|---------------|--------|------------------------------------------------------|
| `title`       | String | **obligatoire**                                      |
| `description` | String | optionnel                                            |
| `status`      | String | enum `['todo', 'in-progress', 'done']`, défaut `todo`|
| `createdAt`   | Date   | auto-généré                                          |

---

## Architecture du pipeline

```
GitHub Push
    │
    ▼
Jenkins (Webhook)
    │
    ├── Stage 1 — Checkout     : git clone du repo
    ├── Stage 2 — Install      : npm ci
    ├── Stage 3 — Lint         : npm run lint (échec si violation ESLint)
    ├── Stage 4 — Test         : npm test --coverage (échec si test KO)
    ├── Stage 5 — Build Docker : docker build :latest + :build-N
    ├── Stage 6 — Deploy       : docker compose up -d
    └── Stage 7 — Notify       : message de succès + URL (BONUS)
          │
          └── post { always | success | failure }
```

Les secrets (ex. `MONGO_URI`) sont injectés via **Jenkins Credentials Manager** (`withCredentials`) — jamais en clair dans le `Jenkinsfile`.

---

## Architecture des services

```
Internet
   │
   ▼ :80
 Nginx (reverse proxy)
   │
   ▼ :5000
 API (Node.js / Express)        Jenkins :8080
   │                            (build, test, deploy
   ▼                             via socket Docker)
 MongoDB (réseau interne uniquement)
```

- MongoDB n'est **pas exposé** à l'extérieur (port 27017 non mappé sur l'hôte)
- Seul le port **80** (Nginx) et le port **8080** (Jenkins) sont publics
- Tous les services communiquent sur un réseau bridge dédié `taskflow-net`
- Le volume nommé `mongo-data` assure la **persistance** des données entre redémarrages

---

## Tests & qualité

```bash
npm test          # Jest + couverture (mongodb-memory-server, sans MongoDB réelle)
npm run lint      # ESLint : no-var, prefer-const, no-unused-vars, eqeqeq
```

- **Couverture : 100 %** sur l'ensemble du code applicatif
- Les tests s'exécutent **sans connexion MongoDB réelle** grâce à `mongodb-memory-server`

---

## Stack technique

| Couche          | Technologie              |
|-----------------|--------------------------|
| Backend         | Node.js 18 + Express     |
| Base de données | MongoDB 7                |
| Tests           | Jest + Supertest         |
| Lint            | ESLint                   |
| Conteneurisation| Docker (multi-stage)     |
| Orchestration   | Docker Compose           |
| Reverse proxy   | Nginx                    |
| CI/CD           | Jenkins (Declarative)    |

---

## Répartition des tâches

| Tâche                                  | Membre 1 (Jérémy) | Membre 2 (Léo) |
|----------------------------------------|:--------------:|:--------------:|
| Initialisation du projet               | ✓              |                |
| Route `/health`                        | ✓              |                |
| Routes CRUD `/api/tasks`               | ✓              |                |
| Connexion MongoDB (`db.js`)            | ✓              |                |
| Docker Compose                         | ✓              |                |
| Jenkinsfile (pipeline 7 stages)        | ✓              |                |
| README                                 | ✓              |                |
| Modèle Mongoose `Task`                 |                | ✓              |
| Configuration ESLint                   |                | ✓              |
| Tests Jest (unitaires + intégration)   |                | ✓              |
| Dockerfile multi-stage                 |                | ✓              |
| Configuration Nginx                    |                | ✓              |
| Stage bonus Jenkins (Notify)           |                | ✓              |

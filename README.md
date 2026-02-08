# THEZ - Gestion des Soutenances Academiques

Plateforme web complete pour la digitalisation et l'automatisation du processus de gestion des soutenances academiques.

**Planifiez. Gerez. Reussissez.**

## Fonctionnalites

- **Gestion des utilisateurs** avec systeme RBAC (Admin, Etudiant, Jury, Encadreur)
- **Gestion des sessions** de soutenance par annee academique
- **Gestion des dossiers** de soutenance (depot, validation)
- **Composition des jurys** (President, Rapporteur, Examinateurs)
- **Planification intelligente** des soutenances (date, heure, salle)
- **Systeme de notifications** automatiques
- **Generation automatique** des proces-verbaux
- **Documentation API** avec Swagger

## Technologies

### Backend
- Django 5.2
- Django REST Framework
- PostgreSQL
- JWT Authentication (Simple JWT)
- Swagger (drf-yasg)

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- shadcn/ui
- React Query (TanStack Query)
- Axios

## Installation

### Prerequis
- Python 3.12+
- PostgreSQL 15+
- Node.js 18+

### Backend Setup

1. **Cloner le repository**
```bash
git clone git@github.com:ArthurEffa/NEW-GESTION-SOUTENANCE-TP-ENSPD.git
cd "GESTION DES SOUTENANCES"
```

2. **Creer un environnement virtuel**
```bash
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Installer les dependances**
```bash
cd backend
pip install -r requirements.txt
```

4. **Configurer les variables d'environnement**

Copier le fichier d'exemple et l'adapter :

```bash
cp ../.env.example .env
```

Ou creer manuellement un fichier `.env` dans le dossier `backend/` :

```env
# Django
SECRET_KEY=votre-secret-key-ici
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database PostgreSQL
DATABASE_URL=postgresql://postgres:votre-mot-de-passe@localhost:5432/appsoutenance2

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

> **Important :** Le `SECRET_KEY` est obligatoire. Vous pouvez en generer une avec :
> `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

5. **Creer la base de donnees PostgreSQL**
```bash
createdb appsoutenance2
```

6. **Appliquer les migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Creer un superutilisateur**
```bash
python manage.py createsuperuser
```

8. **Lancer le serveur**
```bash
python manage.py runserver
```

Backend accessible sur : `http://localhost:8000`

### Frontend Setup

1. **Installer les dependances**
```bash
cd frontend
npm install
```

2. **Configurer les variables d'environnement**

Creer un fichier `.env` dans le dossier `frontend/` :

```env
VITE_API_URL=http://localhost:8000/api
```

> Vous pouvez aussi copier le fichier d'exemple : `cp .env.example .env`

3. **Lancer le serveur de developpement**
```bash
npm run dev
```

Frontend accessible sur : `http://localhost:8080`

## Documentation API

Une fois le backend lance :
- **Swagger UI** : http://localhost:8000/api/docs/
- **ReDoc** : http://localhost:8000/api/redoc/

## Endpoints Principaux

### Authentification
- `POST /api/auth/login/` - Connexion (JWT)
- `POST /api/auth/refresh/` - Rafraichir le token
- `POST /api/auth/logout/` - Deconnexion

### Ressources
- `/api/users/` - Utilisateurs
- `/api/etudiants/` - Etudiants
- `/api/enseignants/` - Enseignants
- `/api/sessions/` - Sessions de soutenance
- `/api/salles/` - Salles
- `/api/dossiers/` - Dossiers de soutenance
- `/api/jurys/` - Jurys
- `/api/soutenances/` - Soutenances

## Structure du Projet

```
GESTION DES SOUTENANCES/
├── backend/
│   ├── gestion_soutenance/      # Configuration Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── app_soutenance/          # Application principale
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   └── urls.py
│   ├── .env                     # Variables d'environnement
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/          # Composants React
│   │   ├── pages/               # Pages de l'application
│   │   ├── contexts/            # Contextes React
│   │   ├── hooks/               # Hooks personnalises
│   │   ├── services/            # Services API
│   │   └── assets/              # Images et assets
│   ├── index.html
│   └── package.json
└── README.md
```

## Roles et Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Gestion complete, validation dossiers, composition jurys, planification |
| **Etudiant** | Creation dossier, upload memoire, consultation soutenance |
| **Jury** | Consultation dossiers, participation aux jurys |
| **Encadreur** | Suivi des etudiants encadres |

## Workflow

### 1. Ouverture de session (Admin)
L'administrateur cree une **session de soutenance** pour une annee academique donnee (ex: 2025-2026). Il definit les dates d'ouverture et de cloture des depots. Les candidats ne peuvent deposer un dossier que pendant une session active.

### 2. Depot du dossier (Candidat)
Le candidat cree son dossier en renseignant le **titre du memoire**, la **session** et son **encadreur**. Il uploade ensuite ses pieces jointes obligatoires :
- Memoire final (PDF)
- Quitus de paiement
- Certificat de scolarite

Tant que le dossier est en **Brouillon**, le candidat peut modifier et ajouter des documents. Une fois pret, il **soumet** son dossier (statut passe a "Depose").

### 3. Validation du dossier (Admin)
L'administrateur consulte les dossiers deposes et les examine :
- **Valider** : le dossier est accepte, le candidat est eligible a la soutenance
- **Rejeter** : le dossier est renvoye avec un commentaire explicatif. Le candidat peut corriger et re-soumettre

### 4. Composition du jury (Admin)
Pour chaque soutenance, l'administrateur compose un **jury** avec les roles suivants :
- **President** : preside la seance
- **Rapporteur** : evalue le memoire en detail
- **Examinateur(s)** : posent des questions et evaluent le candidat

Les enseignants concernes sont notifies de leur role.

### 5. Planification de la soutenance (Admin)
L'administrateur planifie la soutenance en definissant :
- **Date et heure**
- **Salle** (parmi les salles disponibles)
- **Duree** estimee
- **Ordre de passage** (si plusieurs soutenances le meme jour)

### 6. Deroulement et cloture
Le jour venu, la soutenance se deroule. L'administrateur peut :
- **Demarrer** la soutenance (statut "En cours")
- **Terminer** la soutenance (statut "Terminee")

Le candidat et les membres du jury peuvent consulter les informations de la soutenance depuis leur portail respectif.

## Auteur

Arthur Effa - [@ArthurEffa](https://github.com/ArthurEffa)

## Licence

Projet academique - ENSPD

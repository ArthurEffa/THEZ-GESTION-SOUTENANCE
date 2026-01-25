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

Creer un fichier `.env` dans le dossier `backend/` :

```env
# Django
SECRET_KEY=votre-secret-key-ici
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database PostgreSQL
DATABASE_URL=postgresql://postgres:votre-mot-de-passe@localhost:5432/appsoutenance2

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

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

2. **Lancer le serveur de developpement**
```bash
npm run dev
```

Frontend accessible sur : `http://localhost:5173`

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

1. **Admin** cree une session de soutenance
2. **Etudiant** cree son dossier et upload son memoire
3. **Admin** valide le dossier
4. **Admin** compose le jury
5. **Admin** planifie la soutenance
6. **Notifications** envoyees a tous les concernes
7. **Soutenance** se deroule
8. **PV** genere automatiquement

## Auteur

Arthur Effa - [@ArthurEffa](https://github.com/ArthurEffa)

## Licence

Projet academique - ENSPD

# Système de Gestion des Soutenances Académiques

Plateforme web complète pour la digitalisation et l'automatisation du processus de gestion des soutenances académiques.

## 📋 Fonctionnalités

- **Gestion des utilisateurs** avec système RBAC (Admin, Candidat, Enseignant)
- **Gestion des sessions** de soutenance par année académique
- **Gestion des dossiers** de soutenance (dépôt, validation)
- **Composition des jurys** (Président, Rapporteur, Examinateurs)
- **Planification intelligente** des soutenances (date, heure, salle)
- **Système de notifications** automatiques
- **Génération automatique** des procès-verbaux
- **Documentation API** avec Swagger

## 🛠️ Technologies

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- JWT Authentication (Simple JWT)
- Swagger (drf-spectacular)

### Frontend
- React 18 + Vite
- Material-UI
- React Query
- Axios

## 📦 Installation

### Prérequis
- Python 3.12+
- PostgreSQL
- Node.js 18+ (pour le frontend)

### Backend Setup

1. **Cloner le repository**
```bash
git clone <url-du-repo>
cd GESTION\ DES\ SOUTENANCES
```

2. **Créer un environnement virtuel (optionnel)**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configurer les variables d'environnement**

Créer un fichier `.env` dans le dossier `backend/gestion_soutenance/` :

```env
# Django
SECRET_KEY=votre-secret-key-ici
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=gestion_soutenances
DB_USER=postgres
DB_PASSWORD=votre-mot-de-passe
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre-email@example.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe-email
```

5. **Créer la base de données PostgreSQL**
```bash
createdb gestion_soutenances
```

6. **Appliquer les migrations**
```bash
cd backend/gestion_soutenance
python manage.py makemigrations
python manage.py migrate
```

7. **Créer un superutilisateur**
```bash
python manage.py createsuperuser
```

8. **Lancer le serveur de développement**
```bash
python manage.py runserver
```

Le backend sera accessible à : `http://localhost:8000`

## 📚 Documentation API

Une fois le serveur lancé, accédez à :
- **Swagger UI** : http://localhost:8000/api/docs/
- **ReDoc** : http://localhost:8000/api/redoc/
- **Schema OpenAPI** : http://localhost:8000/api/schema/

## 🔑 Endpoints Principaux

### Authentification
- `POST /api/v1/auth/login/` - Connexion (JWT)
- `POST /api/v1/auth/refresh/` - Rafraîchir le token
- `POST /api/v1/auth/logout/` - Déconnexion

### Ressources
- `/api/v1/users/` - Utilisateurs
- `/api/v1/candidats/` - Profils candidats
- `/api/v1/enseignants/` - Profils enseignants
- `/api/v1/sessions/` - Sessions de soutenance
- `/api/v1/salles/` - Salles
- `/api/v1/dossiers/` - Dossiers de soutenance
- `/api/v1/jurys/` - Jurys
- `/api/v1/soutenances/` - Soutenances
- `/api/v1/notifications/` - Notifications
- `/api/v1/commentaires/` - Commentaires

## 🔒 Sécurité

- Authentification JWT avec tokens d'accès et de rafraîchissement
- Permissions basées sur les rôles (RBAC)
- Validation des fichiers uploadés (PDF uniquement pour les mémoires)
- CORS configuré pour les domaines autorisés
- Variables d'environnement pour les secrets

## 📁 Structure du Projet

```
GESTION DES SOUTENANCES/
├── backend/
│   └── gestion_soutenance/
│       ├── gestion_soutenance/      # Configuration Django
│       │   ├── settings.py
│       │   ├── urls.py
│       │   └── wsgi.py
│       ├── app_soutenance/          # Application principale
│       │   ├── models.py            # 13 modèles
│       │   ├── serializers.py       # Serializers DRF
│       │   ├── views.py             # ViewSets API
│       │   ├── permissions.py       # Permissions RBAC
│       │   ├── urls.py              # Routes API
│       │   └── admin.py             # Admin Django
│       └── manage.py
├── frontend/                        # Application React (à venir)
├── requirements.txt                 # Dépendances Python
├── .gitignore
├── .env.example
└── README.md
```

## 👥 Rôles et Permissions

### Admin
- Gestion complète du système
- Création des sessions et salles
- Validation des dossiers
- Composition des jurys
- Planification des soutenances
- Génération des PV

### Candidat
- Création de son dossier
- Upload du mémoire et annexes
- Consultation de sa soutenance
- Réception des notifications

### Enseignant
- Consultation des dossiers (encadreur)
- Participation aux jurys
- Consultation du planning

## 🚀 Workflow Complet

1. **Admin** crée une session de soutenance
2. **Candidat** crée son dossier et upload son mémoire
3. **Admin** valide le dossier
4. **Admin** compose le jury
5. **Admin** crée et planifie la soutenance
6. **Tous** reçoivent des notifications
7. **Soutenance** se déroule
8. **PV** est généré automatiquement

## 📝 Licence

Ce projet est développé dans un cadre académique.

## 👨‍💻 Auteur

[Votre Nom]

# Frontend - Gestion des Soutenances

Application web de gestion des soutenances académiques.

## Technologies

- **React 18** avec TypeScript
- **Vite** - Build tool rapide
- **shadcn-ui** - Composants UI
- **Tailwind CSS** - Styling
- **TanStack Query** - Gestion des données
- **React Router v6** - Navigation
- **React Hook Form** + **Zod** - Formulaires et validation

## Installation

```sh
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## Structure du projet

```
src/
├── components/     # Composants réutilisables
├── pages/          # Pages de l'application
├── contexts/       # Contexts React (Auth, etc.)
├── hooks/          # Hooks personnalisés
├── types/          # Définitions TypeScript
├── config/         # Configuration
└── lib/            # Utilitaires
```

## Configuration

Créer un fichier `.env` à la racine avec:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Développement

Le projet utilise:
- **ESLint** pour le linting
- **TypeScript** en mode strict
- **Vite HMR** pour le rechargement à chaud

## Backend

Ce frontend nécessite le backend Django REST Framework. Voir `/backend/` pour les instructions.

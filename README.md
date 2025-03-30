# Ensemble Calendar

![Ensemble Calendar Logo](/public/placeholder-logo.svg)

## 📅 Présentation

Ensemble Calendar est une application de calendrier familial conçue pour simplifier la gestion des emplois du temps et des événements au sein d'une famille. Cette application permet de coordonner les activités de tous les membres de la famille en un seul endroit, facilitant ainsi l'organisation quotidienne.

## ✨ Fonctionnalités

- **Authentification sécurisée** : Système complet d'inscription, connexion et récupération de mot de passe
- **Gestion des familles** : Création et gestion de groupes familiaux
- **Calendrier partagé** : Visualisation des événements de toute la famille
- **Événements personnalisés** : Création d'événements avec codes couleur, dates et heures
- **Assignation de tâches** : Attribution d'événements à des membres spécifiques de la famille
- **Interface responsive** : Expérience utilisateur optimisée sur tous les appareils

## 🚀 Technologies utilisées

- **Frontend** : [Next.js 15](https://nextjs.org/) avec App Router et React 18
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Authentification & Base de données** : [Supabase](https://supabase.com/) avec [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs)
- **UI/UX** : [shadcn/ui](https://ui.shadcn.com/) et [Tailwind CSS](https://tailwindcss.com/)
- **Gestion des formulaires** : [React Hook Form](https://react-hook-form.com/) et [Zod](https://zod.dev/)
- **Composants UI** : [Radix UI](https://www.radix-ui.com/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Gestionnaire de paquets** : [pnpm](https://pnpm.io/) pour une installation plus rapide et efficace

## 🛠️ Installation

### Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [pnpm](https://pnpm.io/installation) (recommandé pour une installation plus rapide)
- Un compte [Supabase](https://supabase.com/) pour la base de données et l'authentification

### Étapes d'installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/Fz3dev/ensembl.git
cd ensemble-calendar
```

2. **Installer les dépendances**

```bash
# Avec pnpm (recommandé)
pnpm install

# Ou avec npm
npm install
```

3. **Configuration de l'environnement**

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

4. **Lancer le serveur de développement**

```bash
# Avec pnpm
pnpm dev

# Ou avec npm
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000) ou [http://localhost:3001](http://localhost:3001) si le port 3000 est déjà utilisé.

## 📊 Structure du projet

```
ensemble-calendar/
├── app/                  # Structure de l'application Next.js (App Router)
│   ├── auth/             # Pages d'authentification
│   ├── globals.css       # Styles globaux
│   └── layout.tsx        # Layout principal
├── components/           # Composants React réutilisables
│   ├── auth/             # Composants d'authentification
│   └── ui/               # Composants d'interface utilisateur (shadcn/ui)
├── hooks/                # Hooks React personnalisés
├── lib/                  # Fonctions utilitaires
├── public/               # Ressources statiques
├── styles/               # Styles supplémentaires
├── utils/                # Utilitaires, notamment l'intégration Supabase
│   └── supabase/         # Configuration et fonctions Supabase
├── components.json       # Configuration shadcn/ui
├── middleware.ts         # Middleware Next.js (protection des routes)
├── next.config.mjs       # Configuration Next.js
├── package.json          # Dépendances et scripts
├── tailwind.config.ts    # Configuration Tailwind CSS
└── tsconfig.json         # Configuration TypeScript
```

## 🔒 Authentification

Le système d'authentification est basé sur Supabase avec [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) et comprend :
- Inscription avec email/mot de passe
- Connexion sécurisée
- Récupération de mot de passe
- Protection des routes via middleware
- Création automatique de profil utilisateur

## 🧩 Modèle de données

- **Utilisateurs** : Informations de profil et authentification
- **Familles** : Groupes familiaux
- **Membres** : Relations entre utilisateurs et familles
- **Enfants** : Profils des enfants liés aux familles
- **Événements** : Activités planifiées avec dates, heures et assignations
- **Modèles d'événements** : Modèles réutilisables pour créer rapidement des événements

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter.

---

Développé avec ❤️ par [Fz3dev](https://github.com/Fz3dev)

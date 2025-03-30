# Configuration des variables d'environnement

Pour configurer correctement l'application, créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```
NEXT_PUBLIC_SUPABASE_URL=https://tzcrdermwcrbxordhnvr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Y3JkZXJtd2NyYnhvcmRobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjUyODksImV4cCI6MjA1ODkwMTI4OX0.5zI_Sfbn3xRh1AlhLdmNoX0CSkoUM_1bnJnME-VBO8o
```

## Important

- Le fichier `.env.local` est automatiquement ignoré par Git pour des raisons de sécurité
- Ne partagez jamais vos clés d'API dans des dépôts publics
- Si vous travaillez en équipe, partagez ces informations via un canal sécurisé

## Création du fichier

Vous pouvez créer ce fichier manuellement ou exécuter la commande suivante dans votre terminal :

```bash
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://tzcrdermwcrbxordhnvr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Y3JkZXJtd2NyYnhvcmRobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjUyODksImV4cCI6MjA1ODkwMTI4OX0.5zI_Sfbn3xRh1AlhLdmNoX0CSkoUM_1bnJnME-VBO8o
EOL
```

Après avoir créé ce fichier, redémarrez votre serveur de développement si nécessaire.

# ETS EMEA — Réservation de tests de langues

Application composée d’un frontend Next.js / React, d’une API REST Symfony
et d’une base MongoDB avec Doctrine ODM.

## Prérequis

- Docker Desktop démarré, ou Docker Engine avec le plugin Docker Compose v2.
- Git pour récupérer le dépôt, ou une copie locale du projet.
- Ports locaux `3000` et `8000` disponibles.

Vérifier l’installation :

```bash
docker --version
docker compose version
```

Node.js, PHP, Composer et MongoDB sont fournis par les conteneurs : leur
installation sur votre ordinateur n’est pas nécessaire.

## Installation et démarrage

1. Récupérer le dépôt ou extraire le projet.
2. Ouvrir un terminal à la racine du projet, dans le dossier contenant
   `docker-compose.yml`.
3. Construire et démarrer les trois services :

```bash
docker compose up --build -d
```

Le premier démarrage peut prendre plusieurs minutes. Le frontend installe ses
dépendances lors de la construction de l’image. Au démarrage, le backend
synchronise les dépendances Composer, génère les clés JWT si elles sont absentes,
prépare le cache Symfony et lance Apache. Aucune génération manuelle des clés
n’est nécessaire.

Vérifier l’état et consulter les journaux :

```bash
docker compose ps
docker compose logs -f
```

`Ctrl+C` quitte l’affichage des journaux sans arrêter les conteneurs.
Attendre le message de disponibilité de Next.js avant d’ouvrir le frontend.

| Service | Accès | Rôle |
| --- | --- | --- |
| Frontend | http://localhost:3000 | Interface Next.js / React |
| Backend | http://localhost:8000 | API Symfony servie par Apache |
| MongoDB | `database:27017`, depuis Docker | Base `ets_emea` |

Le frontend est actuellement une page vide et les routes métier de l’API ne sont
pas encore implémentées : une réponse 404 à la racine du backend est donc normale.
L’adresse http://localhost:8000/healthz vérifie qu’Apache répond ; elle ne teste
pas les fonctionnalités métier ni la connexion à la base.

## Configuration

Le fichier `docker-compose.yml` décrit les trois conteneurs. Le backend attend
que MongoDB soit prêt ; le frontend peut démarrer indépendamment.

Les paramètres du backend sont définis dans `backend/docker/dev.env`.
`backend/.env` conserve uniquement les valeurs communes du répertoire partagé
Symfony et de l’URL utilisée par les commandes CLI. Pour exécuter Symfony hors
Docker, fournir les paramètres applicatifs, MongoDB, JWT et CORS via
l’environnement ou un fichier `.env.local` ignoré par Git.

Paramètres Docker :

- `MONGODB_URI` et `MONGODB_DB` : connexion et nom de la base.
- `APP_ENV`, `APP_DEBUG` et `APP_SECRET` : configuration Symfony.
- `JWT_SECRET_KEY`, `JWT_PUBLIC_KEY` et `JWT_PASSPHRASE` : signature JWT.
- `CORS_ALLOW_ORIGIN` : origines autorisées pour les appels du navigateur.

Les adresses de l’API pour le frontend sont définies dans Compose :

- `NEXT_PUBLIC_API_URL=http://localhost:8000` pour les appels du navigateur.
- `API_INTERNAL_URL=http://backend` pour les appels serveur depuis Next.js.

Ces variables sont disponibles pour la future intégration Axios.
Après une modification de la configuration Compose ou de `dev.env`, appliquer :

```bash
docker compose up -d
```

Cette configuration est destinée au développement et à l’exécution locale :
Next.js et Symfony utilisent le mode développement, les secrets sont des valeurs
de démonstration et MongoDB n’active pas l’authentification. Les ports applicatifs
sont limités à votre ordinateur et MongoDB n’expose aucun port hôte.
Un déploiement public nécessite une configuration de production avec secrets
privés, authentification MongoDB, HTTPS et build de production du frontend.

## Développement et dépendances

Les dossiers source sont partagés avec les conteneurs pour permettre les
modifications en direct. Les dépendances Linux et les caches utilisent des volumes
séparés des fichiers générés sur votre ordinateur.

Ajouter une dépendance frontend :

```bash
docker compose exec frontend npm install nom-du-paquet
```

Si `package-lock.json` a été modifié sur votre ordinateur ou après une mise à jour
du dépôt, synchroniser les dépendances du conteneur :

```bash
docker compose exec frontend npm ci
```

Ajouter une dépendance backend :

```bash
docker compose exec backend composer require fournisseur/paquet
```

Conserver les fichiers de dépendances et de verrouillage dans Git. Reconstruire
les images après modification des Dockerfiles ou des fichiers sous `docker/` :

```bash
docker compose up --build -d
```

Reconstruire l’image frontend ne remplace pas le contenu d’un volume de dépendances
existant : utiliser `npm ci` comme indiqué ci-dessus.

## Vérifications et commandes utiles

```bash
# Informations Symfony et validation de la configuration
docker compose exec backend php bin/console about
docker compose exec backend php bin/console lint:yaml config
docker compose exec backend php bin/console lint:container

# Analyse du frontend
docker compose exec frontend npm run lint

# Console MongoDB
docker compose exec database mongosh ets_emea

# Journaux du backend uniquement
docker compose logs -f backend
```

Les documents MongoDB seront placés dans `backend/src/Document/`.

## Arrêt et conservation des données

```bash
# Arrêter et supprimer les conteneurs, en conservant les volumes
docker compose down

# Relancer le projet
docker compose up -d
```

Les volumes conservent les dépendances, les caches, les clés JWT et les données
MongoDB. Ils ne constituent pas des conteneurs supplémentaires.

Pour une remise à zéro volontaire uniquement :

```bash
docker compose down --volumes
```

Cette dernière commande supprime aussi les données MongoDB et les clés JWT.

## Dépannage

- **Docker inaccessible** : démarrer Docker Desktop ou le service Docker.
- **Port déjà utilisé** : arrêter l’application qui occupe le port concerné.
- **Erreur au démarrage** : consulter `docker compose logs frontend backend database`.
- **Paquet frontend introuvable** : exécuter `docker compose exec frontend npm ci`.
- **Backend 404 sur `/`** : attendu tant que les routes métier ne sont pas créées.

# Utiliser une image officielle de Node.js
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le reste du code source dans le conteneur
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 3300

# Définir la variable d'environnement pour la production (optionnel)
ENV NODE_ENV=production

# Commande pour démarrer l'application
CMD ["node", "index.js"]

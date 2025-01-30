# Étape 1 : Build de l'application
FROM node:18 AS builder

WORKDIR /app

# Copier les fichiers du projet
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Construire le projet en version production
RUN npm run build

# Étape 2 : Servir l'application avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés dans Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier le fichier de configuration personnalisé pour NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80 pour accéder au frontend
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]

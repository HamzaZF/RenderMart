# RenderMart - Plateforme de Génération d'Images IA

RenderMart est une **plateforme cloud-native** qui permet aux utilisateurs de **générer des images basées sur l'intelligence artificielle**.

---

## 🚀 Fonctionnalités principales

### 🎨 Génération d'images IA
- Utilisation de **AWS Bedrock** pour générer des images de haute qualité.
- Personnalisation des images selon les préférences des utilisateurs.

### ☁️ Stockage et Accessibilité Cloud
- **Stockage des images sur AWS S3** pour une accessibilité et une scalabilité optimale.
- **API Gateway et AWS Lambda** pour exposer de manière sécurisée les fonctionnalités de génération et gestion d'images.

### 🏗️ Architecture microservices
- **Backend** : API REST développée avec **Node.js & Express**.
- **Frontend** : Interface utilisateur moderne avec **React.js & Vite**.
- **Base de données** : PostgreSQL avec stockage persistant.
- **Communication interne** : Utilisation des **Services Kubernetes et Ingress Controller** pour la connectivité.

### ☁️ Déploiement et scalabilité cloud-native
- Conteneurisation avec **Docker** pour une gestion simplifiée des services.
- Orchestration et gestion des ressources avec **Kubernetes**.
- Gestion du trafic avec **AWS Load Balancer Controller**.
- Automatisation des builds et déploiements avec **GitHub Actions** et **Skaffold**.

---

## 🛠️ Technologies utilisées

### 🌍 Cloud & Stockage
- **AWS S3** (Stockage des images générées)
- **AWS Lambda** (Exécution des fonctions serverless)
- **API Gateway** (Gestion des accès et endpoints)
- **AWS EKS** (Orchestration des conteneurs)
- **AWS ECR** (Registry pour stocker les images Docker)

### 🏗️ Orchestration & Conteneurisation
- **Kubernetes** (Orchestration des microservices)
- **Docker** (Conteneurisation des services)

### 🖥️ Backend
- **Node.js** (Exécution du serveur backend)
- **Express.js** (Framework API REST)
- **PostgreSQL** (Base de données relationnelle)

### 🎨 Frontend
- **React.js** (Framework UI)
- **Vite** (Optimisation du frontend)
- **TailwindCSS** (Framework CSS)
- **Nginx** (Serveur pour le frontend)

### ⚙️ CI/CD et Automatisation
- **GitHub Actions** (Automatisation des builds et tests)
- **Skaffold** (Automatisation du déploiement sur Kubernetes)
- **Helm** (Gestion des composants Kubernetes)

---

## 🏗️ Déploiement et outils nécessaires

RenderMart est conçu pour être déployé sur **AWS** et nécessite les outils suivants :

| Outil | Rôle |
|---|---|
| `eksctl` | Création et gestion du cluster EKS |
| `kubectl` | Interaction avec Kubernetes |
| `helm` | Installation des composants (Ingress, Load Balancer, etc.) |
| `skaffold` | Automatisation des builds et du déploiement |
| `aws-cli` | Gestion des ressources AWS |
| `docker` | Création et gestion des conteneurs |

> **Remarque** : Avant de commencer, assurez-vous que ces outils sont installés et configurés correctement.

---

## 📁 Kubernetes - Explication des fichiers de configuration

L'architecture de **RenderMart** repose sur Kubernetes pour assurer la résilience et la scalabilité des services. Voici les fichiers Kubernetes principaux et leur rôle.

### 📌 Ingress Controller (`ingress.yaml`)

Définit les règles de routage pour acheminer le trafic vers les services internes de l'application.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
  namespace: rendermart
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb
  rules:
    - http:
        paths:
          - path: /api/ # Toutes les requêtes qui commencent par /api vont au backend
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 80

          - path: / # Tout le reste va au frontend
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```


- Expose le frontend et le backend via un **AWS Load Balancer**.
- Route `/api/` vers le backend et `/` vers le frontend.

### 🔹 Backend Deployment (`backend-deployment.yaml`)

Décrit comment le backend est déployé en tant que **pods répliqués**.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: rendermart
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-backend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3300
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: postgres-secret
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"
```

- Exécute l’image Docker du backend stockée dans **ECR**.
- Crée **2 réplicas** pour assurer la disponibilité.
- Définit l'accès sur le **port 4000**.

### 🔹 Backend Service (`backend-service.yaml`)

Expose le backend à l’intérieur du cluster Kubernetes.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: rendermart
spec:
  selector:
    app: backend
  type: ClusterIP
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3300
```


- Définit un **Service Kubernetes** en mode `ClusterIP`.
- Permet aux autres services internes d’accéder au backend.

### 🔹 Frontend Deployment (`frontend-deployment.yaml`)

Décrit le déploiement du frontend.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: rendermart
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-frontend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 80
          envFrom:
            - configMapRef:
                name: frontend-config
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"

```


- Déploie l’image Docker du frontend (stockée dans **ECR**).
- Exécute le serveur **Nginx** pour servir l’interface utilisateur.
- Définit **2 réplicas** pour la haute disponibilité.

### 🔹 Frontend Service (`frontend-service.yaml`)

Expose le frontend pour qu’il puisse être accessible via **Ingress**.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: rendermart
spec:
  ports:
    - port: 80
      targetPort: 80
  selector:
    app: frontend
  type: ClusterIP

```


- Définit un **Service Kubernetes** pour le frontend.
- Assure la communication entre le frontend et le Load Balancer.

### 🗄️ PostgreSQL StatefulSet (`postgres-statefulset.yaml`)

Définit la base de données PostgreSQL en mode **StatefulSet** pour assurer la persistance des données.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: rendermart-db
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      nodeSelector:
        eks.amazonaws.com/nodegroup: efs-nodegroup
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          envFrom:
            - secretRef:
                name: postgres-secret
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
              subPath: postgres
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
```

- Garantit que PostgreSQL conserve ses données même après un redémarrage.
- Associe un **Volume Persistant** basé sur **EBS CSI**.
- Définit une demande de stockage de **10Gi** pour la base de données.

### 🔹 PostgreSQL Service (`postgres-service.yaml`)

Expose PostgreSQL au sein du cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: rendermart-db
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
  clusterIP: None
```


- Définit un **Service Kubernetes** permettant au backend d’accéder à PostgreSQL.
- Fonctionne en mode `ClusterIP` pour une communication interne sécurisée.

---

## 📞 Support

Si vous avez des questions, ouvrez une issue ou contactez-nous à `support@rendermart.com`.


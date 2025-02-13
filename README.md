# RenderMart - Plateforme de Génération et Vente d'Images IA

RenderMart est une **plateforme cloud-native** qui permet aux utilisateurs de **générer, vendre et acheter des images générées par IA**.  
L'application repose sur **AWS Bedrock**, **S3**, **API Gateway** et **Lambda** pour fournir un environnement évolutif et performant.

---

## 🚀 Fonctionnalités principales

### 🎨 Génération d'images IA
- Utilisation de **AWS Bedrock** pour générer des images de haute qualité
- Personnalisation des images selon les préférences des utilisateurs

### 🛒 Vente et Achat d'Images
- Les utilisateurs peuvent mettre en vente leurs images générées
- Paiement et gestion des transactions intégrés

### ☁️ Stockage et Accessibilité Cloud
- **Stockage des images sur AWS S3**
- **API Gateway et AWS Lambda** pour une exposition sécurisée et évolutive
- **Système de cache et CDN** pour accélérer l'affichage des images

### 🏗️ Architecture microservices
- **Backend** : API REST via **Node.js & Express**
- **Frontend** : Interface moderne développée en **React.js & Vite**
- **Base de données** : PostgreSQL avec stockage persistant via **EBS CSI Driver**
- **Communication interne** : Services Kubernetes avec **Ingress Controller**

### ☁️ Déploiement et scalabilité cloud-native
- Conteneurisation avec **Docker**
- Orchestration des microservices avec **Kubernetes**
- Stockage persistant avec **EBS CSI Driver**
- Load Balancing et exposition des services via **AWS Load Balancer Controller**
- CI/CD avec **GitHub Actions**

---

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express, AWS Lambda, API Gateway, PostgreSQL
- **Frontend** : React.js, Vite, TailwindCSS, Nginx
- **Infrastructure** : Kubernetes, AWS EKS, EBS CSI, Ingress Controller, Helm
- **Stockage & IA** : AWS S3, AWS Bedrock
- **CI/CD** : Docker, Skaffold, GitHub Actions

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

## 📁 Manifests Kubernetes

L’application suit une **approche microservices** avec plusieurs **manifests Kubernetes** qui définissent les ressources nécessaires.

### 📌 Ingress Controller (`ingress.yaml`)
Gère le routage des requêtes entre le frontend et le backend.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rendermart-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api/
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 4000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

> **Pourquoi ?**  
> Ce fichier permet de rediriger les requêtes : `/api/` vers le backend et `/` vers le frontend. Cela garantit une bonne isolation des services.

### 🔹 Backend Deployment (`backend-deployment.yaml`)
Déploie le **backend Node.js** sous forme de pods dans Kubernetes.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
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
        image: <AWS_ECR_BACKEND_IMAGE>
        ports:
        - containerPort: 4000
```

> **Pourquoi ?**  
> - Définit **2 replicas** pour assurer la disponibilité du backend.
> - Spécifie **l’image Docker du backend** stockée dans **ECR**.
> - Ouvre le **port 4000** pour recevoir les requêtes API.

### 🔹 Frontend Deployment (`frontend-deployment.yaml`)
Déploie le **frontend React.js** sous forme de pods.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
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
        image: <AWS_ECR_FRONTEND_IMAGE>
        ports:
        - containerPort: 80
```

> **Pourquoi ?**  
> - Définit **2 replicas** pour le frontend.
> - Utilise **Nginx** pour servir l’application.
> - Relie le frontend au **Load Balancer**.

### 🗄️ PostgreSQL StatefulSet (`postgres-statefulset.yaml`)
Définit la base de données PostgreSQL avec un **stockage persistant**.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-db
spec:
  serviceName: "postgres"
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:latest
        ports:
        - containerPort: 5432
        volumeMounts:
        - mountPath: /var/lib/postgresql/data
          name: postgres-storage
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "gp2"
      resources:
        requests:
          storage: 10Gi
```

> **Pourquoi ?**  
> - Utilise un **StatefulSet** pour garantir un stockage **persistant**.
> - Stocke les données PostgreSQL sur un volume EBS CSI.
> - Définit un **VolumeClaimTemplate** de **10Gi** pour le stockage.

---

## 📞 Support

Si vous avez des questions, ouvrez une issue ou contactez-nous à `support@rendermart.com`.


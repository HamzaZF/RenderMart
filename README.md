# RenderMart - Application Cloud-Native sur AWS EKS

RenderMart est une **plateforme de e-commerce cloud-native** conçue pour fonctionner en **architecture microservices**.  
L'application est déployée sur **AWS EKS (Elastic Kubernetes Service)** et utilise des technologies modernes pour assurer une scalabilité et une résilience optimales.

---

## 🚀 Fonctionnalités principales

### 🛒 Gestion des produits et commandes
- Ajout, modification et suppression de produits via une API REST
- Gestion des commandes et des paiements
- Interface utilisateur fluide et réactive

### 🏗️ Architecture microservices
- **Backend** : API REST développée avec **Node.js & Express**
- **Frontend** : Application React.js avec **Vite & TailwindCSS**
- **Base de données** : **PostgreSQL** avec stockage persistant sur **EBS CSI Driver**
- **Communication interne** via **Kubernetes Services & Ingress Controller**

### ☁️ Déploiement et scalabilité cloud-native
- Conteneurisation avec **Docker**
- Orchestration des microservices avec **Kubernetes**
- Stockage persistant pour la base de données grâce à **EBS CSI Driver**
- Load Balancing et exposition des services via **AWS Load Balancer Controller**
- Gestion automatisée du build et du déploiement avec **Skaffold**
- CI/CD via **GitHub Actions**

---

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express, PostgreSQL
- **Frontend** : React.js, Vite, TailwindCSS, Nginx
- **Infrastructure** : Kubernetes, AWS EKS, EBS CSI, Ingress Controller, Helm
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

## 🛠️ Configuration et Secrets

Avant le déploiement, **vous devez configurer certaines variables d’environnement**.

1️⃣ **Définir l’URL du Load Balancer dans `frontend/.env`**

```env
VITE_INGRESS_IP=http://k8s-renderma-ingress-XXXXX.us-east-1.elb.amazonaws.com
```

2️⃣ **Configurer les secrets GitHub Actions**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REGISTRY`

3️⃣ **Définir l’URL de l’API Gateway dans `backend/.env`**

```env
AWS_LAMBDA_URL=https://my-api-id.execute-api.us-east-1.amazonaws.com/prod
```

---

## 📞 Support

Si vous avez des questions, ouvrez une issue ou contactez-nous à `support@rendermart.com`.


# RenderMart - Plateforme de Génération d'Images IA

RenderMart est une **plateforme cloud-native** qui permet aux utilisateurs de **générer des images basées sur l'intelligence artificielle**.

---

## 🚀 Fonctionnalités principales

### 🎨 Génération d'images IA
- Utilisation de **AWS Bedrock** pour générer des images de haute qualité
- Personnalisation des images selon les préférences des utilisateurs

### ☁️ Stockage et Accessibilité Cloud
- **Stockage des images sur AWS S3**
- **API Gateway et AWS Lambda** pour une exposition sécurisée et évolutive

### 🏗️ Architecture microservices
- **Backend** : API REST via **Node.js & Express**
- **Frontend** : Interface moderne développée en **React.js & Vite**
- **Base de données** : PostgreSQL avec stockage persistant
- **Communication interne** : Services Kubernetes avec **Ingress Controller**

### ☁️ Déploiement et scalabilité cloud-native
- Conteneurisation avec **Docker**
- Orchestration des microservices avec **Kubernetes**
- Load Balancing et exposition des services via **AWS Load Balancer Controller**
- CI/CD avec **GitHub Actions** et **Skaffold**

---

## 🛠️ Technologies utilisées

### 🌍 Cloud & Stockage
- **AWS S3** (Stockage des images générées)
- **AWS Lambda** (Exécution des fonctions serverless)
- **API Gateway** (Gestion des accès et endpoints)
- **AWS EKS** (Orchestration des conteneurs)
- **AWS ECR** (Stockage des images Docker)

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

## 📁 Manifests Kubernetes - Architecture et Explication

L’architecture de **RenderMart** repose sur **Kubernetes** pour orchestrer ses composants. Chaque fichier manifest définit un élément clé du système.

### 📌 1. Ingress Controller (`ingress.yaml`)

**Rôle :**  
L’Ingress Controller permet de gérer le routage des requêtes entre les services internes (backend et frontend). Il assure la **gestion des entrées** vers l'application et l'intégration avec le **AWS Load Balancer Controller**.

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

🔹 **Pourquoi est-ce important ?**  
- Redirige `/api/` vers le backend et `/` vers le frontend.
- Permet d’exposer l’application au public via un Load Balancer AWS.

---

### 🔹 2. Backend Deployment (`backend-deployment.yaml`)

**Rôle :**  
Ce fichier définit le déploiement du backend sous forme de **pods répliqués** dans Kubernetes.

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

🔹 **Pourquoi est-ce important ?**  
- Crée **2 replicas** du backend pour la haute disponibilité.
- Stocke l’image Docker du backend dans **AWS ECR**.
- Définit un **service Kubernetes** qui permet aux autres composants de communiquer avec lui.

---

### 🔹 3. Backend Service (`backend-service.yaml`)

**Rôle :**  
Le service expose le backend à l’intérieur du cluster et permet la communication avec d’autres composants (Ingress, Frontend, Base de données).

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: ClusterIP
```

---

### 🔹 4. Frontend Deployment (`frontend-deployment.yaml`)

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

---

### 🗄️ 5. PostgreSQL StatefulSet (`postgres-statefulset.yaml`)

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

---

## 📞 Support

Si vous avez des questions, ouvrez une issue ou contactez-nous à `support@rendermart.com`.


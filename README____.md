# RenderMart - Déploiement Kubernetes sur AWS EKS

RenderMart est une application web complète comprenant un **backend Node.js**, un **frontend React.js** et une **base de données PostgreSQL**.  
Ce projet est conçu pour être déployé sur **AWS EKS** avec **Skaffold** pour automatiser la gestion des builds et déploiements.

---

## 📌 Technologies utilisées

### Backend
- **Node.js** avec **Express.js** (API REST)
- Gestion des dépendances avec **npm**
- Conteneurisation avec **Docker**

### Frontend
- **React.js** avec **Vite** (pour des builds rapides)
- **TailwindCSS** (pour le styling)
- **Nginx** (pour servir les fichiers statiques)
- Gestion des dépendances avec **npm**

### Base de données
- **PostgreSQL** (déployé en StatefulSet)
- Stockage persistant via **EBS CSI Driver**

### Infrastructure et Déploiement
- **AWS EKS** (Elastic Kubernetes Service)
- **AWS ECR** (Elastic Container Registry)
- **AWS Lambda** (pour certaines fonctionnalités spécifiques)
- **API Gateway** (pour exposer certaines routes Lambda)
- **Helm** (pour AWS Load Balancer Controller)
- **Skaffold** (pour automatiser le build et le déploiement)
- **Github Actions** (CI/CD)

---

## 🔥 Configuration requise avant le déploiement

Avant de procéder au déploiement, **vous devez configurer plusieurs éléments** :

### 1️⃣ Secrets GitHub Actions

Si vous utilisez GitHub Actions pour automatiser le CI/CD, assurez-vous de configurer les **secrets GitHub** :

- `AWS_ACCESS_KEY_ID` → Clé d'accès AWS IAM
- `AWS_SECRET_ACCESS_KEY` → Clé secrète AWS IAM
- `AWS_REGION` → Région AWS (`us-east-1` par défaut)
- `ECR_REGISTRY` → `xxxxx.dkr.ecr.us-east-1.amazonaws.com` (remplacez par votre ID AWS)
- `KUBECONFIG` → Contenu du fichier `~/.kube/config` (optionnel)
- `INGRESS_URL` → L'URL de votre Load Balancer AWS (expliqué ci-dessous)

Extrait de votre GitHub Actions (`.github/workflows/main.yaml`) :

```yaml
name: Deploy to EKS with Skaffold

on:
  push:
    branches:
      - main # Déclenchement sur push vers main

jobs:
  deploy:
    name: Build & Deploy with Skaffold
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_...
```

(Le fichier complet se trouve dans `.github/workflows/main.yaml`)

### 2️⃣ Configuration de l'API Gateway et AWS Lambda

Votre projet utilise **AWS Lambda** et **API Gateway** pour certaines fonctionnalités. Avant le déploiement :

1. **Créez une Lambda sur AWS**  
2. **Déployez l'API Gateway** et obtenez son URL  
3. **Ajoutez cette URL en variable d'environnement (`.env`) du backend**  
   
Exemple dans **backend/.env** :

```env
AWS_LAMBDA_URL=https://my-api-id.execute-api.us-east-1.amazonaws.com/prod
```

### 3️⃣ Définir l'URL du Load Balancer dans le frontend

Après le déploiement de l'Ingress Controller, récupérez l'URL du Load Balancer AWS et mettez-la dans **frontend/.env** :

```env
VITE_INGRESS_IP=http://k8s-renderma-ingress-77a757caa3-1662937834.us-east-1.elb.amazonaws.com
```

⚠️ **Important :** Cette URL est générée automatiquement après le déploiement. Vous pouvez la retrouver avec :

```bash
kubectl get ingress -n rendermart
```

---

## 🚀 Déploiement sur AWS EKS

### 1️⃣ Création du cluster EKS

```bash
eksctl create cluster --name rendermart --region us-east-1 --fargate
aws eks update-kubeconfig --name rendermart --region us-east-1
eksctl utils associate-iam-oidc-provider --cluster rendermart --approve
```

### 2️⃣ Installation du AWS Load Balancer Controller

```bash
helm repo add eks https://aws.github.io/eks-charts

helm install aws-load-balancer-controller eks/aws-load-balancer-controller   -n kube-system   --set clusterName=rendermart   --set serviceAccount.create=false   --set serviceAccount.name=aws-load-balancer-controller   --set region=us-east-1
```

### 3️⃣ Création du NodeGroup (Obligatoire pour PostgreSQL)

```bash
eksctl create nodegroup --cluster rendermart   --name efs-nodegroup   --node-type t3.large   --nodes 2 --nodes-min 1 --nodes-max 3   --node-volume-size 20 --region us-east-1
```

### 4️⃣ Installation du EBS CSI Driver

```bash
eksctl create iamserviceaccount   --region us-east-1   --name ebs-csi-controller-sa   --namespace kube-system   --cluster rendermart   --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy   --approve

eksctl create addon --name aws-ebs-csi-driver --cluster rendermart   --service-account-role-arn arn:aws:iam::<ACCOUNT_ID>:role/AmazonEKS_EBS_CSI_DriverRole --force
```

### 5️⃣ Création des repositories ECR et Authentification

```bash
aws ecr create-repository --repository-name rendermart-backend
aws ecr create-repository --repository-name rendermart-frontend

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

### 6️⃣ Déploiement via Skaffold

#### 🔹 Build et déploiement automatique

```bash
skaffold run
```

#### 🔹 Séparer les étapes (Optionnel)

```bash
skaffold build   # Construire et pousser les images
skaffold deploy  # Déployer les manifests Kubernetes
```

---

## 📁 Structure du projet

```
rendermart/
│── backend/               # Backend Node.js (Express)
│   ├── index.js           # Point d'entrée
│   ├── package.json       # Dépendances backend
│   ├── Dockerfile         # Backend Dockerfile
│
│── frontend/              # Frontend React.js (Vite + Tailwind)
│   ├── src/               # Code source React
│   ├── package.json       # Dépendances frontend
│   ├── Dockerfile         # Frontend Dockerfile
│
│── k8s/                   # Manifests Kubernetes
│   ├── ingress.yaml       # Load balancer + routing
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── postgres-statefulset.yaml
│
│── .github/workflows/      # CI/CD avec Github Actions
│── skaffold.yaml           # Automatisation Skaffold
```

---

## 📜 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, de le modifier et de le distribuer.

---

## 🤝 Contribuer

Si vous souhaitez contribuer :
1. Forkez ce dépôt
2. Créez une branche (`git checkout -b feature-ma-branche`)
3. Effectuez vos modifications
4. Poussez (`git push origin feature-ma-branche`)
5. Ouvrez une Pull Request

---

## 📞 Support

Si vous avez des questions, ouvrez une issue ou contactez-nous à `support@rendermart.com`.


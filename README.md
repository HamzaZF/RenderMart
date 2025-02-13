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
- **Helm** (pour AWS Load Balancer Controller)
- **Skaffold** (pour automatiser le build et le déploiement)
- **Github Actions** (CI/CD)

---

## 🚀 Déploiement sur AWS EKS

### 1️⃣ Prérequis

Avant de commencer, assurez-vous d'avoir :

- **AWS CLI** installé et configuré
- **eksctl** installé (`brew install eksctl` ou `choco install eksctl`)
- **kubectl** installé (`brew install kubectl` ou `choco install kubectl`)
- **Docker** installé et en cours d'exécution
- **Helm** installé (`brew install helm` ou `choco install kubernetes-helm`)
- **Skaffold** installé (`brew install skaffold` ou `choco install skaffold`)

### 2️⃣ Création du cluster EKS

```bash
eksctl create cluster --name rendermart --region us-east-1 --fargate
aws eks update-kubeconfig --name rendermart --region us-east-1
eksctl utils associate-iam-oidc-provider --cluster rendermart --approve
```

### 3️⃣ Installation du AWS Load Balancer Controller

```bash
helm repo add eks https://aws.github.io/eks-charts

helm install aws-load-balancer-controller eks/aws-load-balancer-controller   -n kube-system   --set clusterName=rendermart   --set serviceAccount.create=false   --set serviceAccount.name=aws-load-balancer-controller   --set region=us-east-1
```

### 4️⃣ Création du NodeGroup (Obligatoire pour PostgreSQL)

```bash
eksctl create nodegroup --cluster rendermart   --name efs-nodegroup   --node-type t3.large   --nodes 2 --nodes-min 1 --nodes-max 3   --node-volume-size 20 --region us-east-1
```

### 5️⃣ Installation du EBS CSI Driver

```bash
eksctl create iamserviceaccount   --region us-east-1   --name ebs-csi-controller-sa   --namespace kube-system   --cluster rendermart   --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy   --approve

eksctl create addon --name aws-ebs-csi-driver --cluster rendermart   --service-account-role-arn arn:aws:iam::<ACCOUNT_ID>:role/AmazonEKS_EBS_CSI_DriverRole --force
```

### 6️⃣ Création des repositories ECR et Authentification

```bash
aws ecr create-repository --repository-name rendermart-backend
aws ecr create-repository --repository-name rendermart-frontend

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

### 7️⃣ Déploiement via Skaffold

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


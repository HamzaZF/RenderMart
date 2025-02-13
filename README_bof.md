# README – Déploiement EKS avec Skaffold, NodePort et EBS CSI

Ce guide décrit pas à pas comment créer et configurer un cluster EKS, installer les add-ons nécessaires (dont **AWS Load Balancer Controller** et **EBS CSI Driver**), configurer **NodePort** pour l’exposition de services, puis déployer votre application (backend + frontend + base de données Postgres) via **Skaffold**.  

> **Important :**  
> - L’utilisation d’un **NodeGroup** et de l’add-on **EBS CSI** est **obligatoire** pour permettre un stockage persistant à votre StatefulSet Postgres.  
> - Dans les exemples ci-dessous, remplacez tous les `<PLACEHOLDERS>` par vos valeurs réelles (ex: `<ACCOUNT_ID>`, `<REGION>`, `<CLUSTER_NAME>`, `<VPC_ID>`, etc.).  
> - Les commandes sont indiquées à titre d’exemple et doivent être adaptées à votre contexte.

---

## 1. Création et configuration du cluster EKS

### 1.1 Créer le cluster EKS (Fargate)

```bash
eksctl create cluster   --name <CLUSTER_NAME>   --region <REGION>   --fargate
```

### 1.2 Mettre à jour le kubeconfig

```bash
aws eks update-kubeconfig   --name <CLUSTER_NAME>   --region <REGION>
```

### 1.3 Associer le provider IAM OIDC

```bash
eksctl utils associate-iam-oidc-provider   --cluster <CLUSTER_NAME>   --approve
```

---

## 2. Installer et configurer le AWS Load Balancer Controller

### 2.1 Créer la policy IAM (si pas déjà existante)

```bash
curl -o iam-policy.json   https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/refs/heads/main/docs/install/iam_policy.json
```

### 2.2 Créer le service account IAM pour le ALB Controller

```bash
eksctl create iamserviceaccount   --cluster=<CLUSTER_NAME>   --namespace=kube-system   --name=aws-load-balancer-controller   --role-name aws-load-balancer-controller-role   --attach-policy-arn=arn:aws:iam::<ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy   --approve
```

### 2.3 Installer le ALB Controller via Helm

```bash
helm repo add eks https://aws.github.io/eks-charts

helm install aws-load-balancer-controller eks/aws-load-balancer-controller   -n kube-system   --set clusterName=<CLUSTER_NAME>   --set serviceAccount.create=false   --set serviceAccount.name=aws-load-balancer-controller   --set region=<REGION>   --set vpcId=<VPC_ID>
```

---

## 3. Créer un Fargate Profile (pour le namespace principal)

```bash
eksctl create fargateprofile   --cluster <CLUSTER_NAME>   --region <REGION>   --name fargate-profile-<CLUSTER_NAME>   --namespace rendermart   --selector app!=postgres
```

---

## 4. Créer un NodeGroup (obligatoire pour EBS CSI et NodePort)

Pour permettre l’accès **NodePort** et la gestion du **stockage persistant** (StatefulSet Postgres), vous devez créer un NodeGroup. Fargate seul ne suffit pas pour l’EBS CSI Driver.

```bash
eksctl create nodegroup   --cluster <CLUSTER_NAME>   --name efs-nodegroup   --node-type t3.large   --nodes 2   --nodes-min 1   --nodes-max 3   --node-volume-size 20   --region <REGION>
```

> **Note :** Ici, le nom `efs-nodegroup` n’est qu’un exemple.

---

## 5. Installer et configurer le EBS CSI Driver (obligatoire)

### 5.1 Créer le service account IAM

```bash
eksctl create iamserviceaccount   --region <REGION>   --name ebs-csi-controller-sa   --namespace kube-system   --cluster <CLUSTER_NAME>   --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy   --approve   --role-only   --role-name AmazonEKS_EBS_CSI_DriverRole
```

### 5.2 Installer l’add-on EBS CSI Driver

```bash
eksctl create addon   --name aws-ebs-csi-driver   --cluster <CLUSTER_NAME>   --service-account-role-arn arn:aws:iam::<ACCOUNT_ID>:role/AmazonEKS_EBS_CSI_DriverRole   --force
```

---

## 6. Créer les dépôts ECR (si pas déjà fait)

```bash
aws ecr create-repository --repository-name rendermart-backend
aws ecr create-repository --repository-name rendermart-frontend
```

---

## 7. Authentification à ECR

Assurez-vous de vous connecter à ECR avant le build/push :

```bash
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
```

---

## 8. Déploiement via Skaffold

Le fichier `skaffold.yaml` (ou `skaffold/v4beta12`) définit :
- Les images à construire (`artifacts`),
- Les dépôts cibles (ECR),
- Les manifests Kubernetes à appliquer (section `manifests`).

### 8.1 Lancer le build + déploiement

```bash
skaffold run
```

Cette commande va :
1. **Construire** les images Docker (backend, frontend) via les `Dockerfile` indiqués,  
2. **Pousser** les images dans ECR (grâce à `local.push: true`),  
3. **Appliquer** tous les manifests listés (StatefulSet Postgres, Services, ConfigMaps, Ingress, etc.).

### 8.2 Séparer les étapes (optionnel)

- **Build uniquement :** `skaffold build`  
- **Déploiement uniquement :** `skaffold deploy`

---

## 9. Conclusion

En suivant ces étapes, vous disposerez :
- D’un **cluster EKS** (Fargate + NodeGroup) prêt à accueillir votre application,
- Du **Load Balancer Controller** pour gérer vos Ingress,
- Du **EBS CSI Driver** pour le stockage persistant de votre base de données,
- D’un **workflow Skaffold** permettant de builder et déployer facilement l’ensemble (backend, frontend et Postgres).

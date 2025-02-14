# RenderMart - Kubernetes Deployment on AWS EKS

## Overview

RenderMart is a cloud-native application deployed on AWS using Kubernetes (EKS). This repository contains the necessary configurations and scripts to deploy the backend, frontend, and database components in a Kubernetes cluster.

## Project Structure

```
rendermart/
│── backend/       # Backend application code
│── frontend/      # Frontend application code
│── k8s/           # Kubernetes manifests
│   ├── backend/   # Backend deployment configs
│   ├── frontend/  # Frontend deployment configs
│   ├── postgres/  # PostgreSQL database configs
│   ├── utils/     # Utility scripts and configs
│── lambda/        # AWS Lambda functions (if applicable)
│── policies/      # IAM policies and security configurations
```

## Prerequisites

- AWS CLI installed and configured
- `kubectl` installed
- `eksctl` installed
- AWS IAM permissions to create and manage EKS clusters
- Docker installed

## Deployment Steps

### Step 1: Create an EKS Cluster

```sh
eksctl create cluster --name rendermart-cluster --region us-east-1 --nodegroup-name standard-workers --node-type t3.medium --nodes 3
```

### Step 2: Configure `kubectl`

```sh
aws eks update-kubeconfig --region us-east-1 --name rendermart-cluster
kubectl get nodes
```

### Step 3: Deploy PostgreSQL Database

```sh
kubectl apply -f k8s/postgres/
```

### Step 4: Deploy Backend Services

```sh
kubectl apply -f k8s/backend/
```

### Step 5: Deploy Frontend

```sh
kubectl apply -f k8s/frontend/
```

### Step 6: Verify Deployments

```sh
kubectl get pods
kubectl get services
```

### Step 7: Expose the Application

Use a LoadBalancer or an Ingress Controller to expose the application.

```sh
kubectl apply -f k8s/utils/ingress.yaml  # If using an Ingress Controller
kubectl get ingress
```

### Step 8: Cleanup Resources

To delete the cluster when no longer needed:

```sh
eksctl delete cluster --name rendermart-cluster --region us-east-1
```

## Additional Notes

- Modify the Kubernetes manifests as needed to fit your environment.
- Ensure IAM roles and security policies are properly set up.
- Use a CI/CD pipeline for automated deployment.

## Author

RenderMart DevOps Team

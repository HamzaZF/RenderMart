# RenderMart - Kubernetes Deployment

RenderMart is a cloud-based e-commerce platform deployed on AWS using Kubernetes. This project includes backend, frontend, and database services, all managed within Kubernetes namespaces.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Kubernetes Configuration](#kubernetes-configuration)
- [Deployment Guide](#deployment-guide)
- [Services Overview](#services-overview)
- [Ingress Configuration](#ingress-configuration)
- [Security Considerations](#security-considerations)
- [Scaling and Resource Management](#scaling-and-resource-management)
- [Conclusion](#conclusion)

## Project Overview

RenderMart is designed to be a scalable, secure, and cloud-native e-commerce platform. It utilizes Kubernetes for orchestration, AWS for hosting, and PostgreSQL as the database.

## Architecture

- **Frontend**: Serves the user interface, deployed as a Kubernetes Deployment.
- **Backend**: Handles business logic and database interactions, deployed in a separate namespace.
- **Database**: PostgreSQL running in a stateful Kubernetes setup.
- **Ingress**: Uses AWS ALB (Application Load Balancer) to manage traffic routing.

## Technologies Used

- **Kubernetes**: Orchestrates the application.
- **AWS EKS**: Managed Kubernetes service.
- **PostgreSQL**: Relational database.
- **Docker**: Containerization.
- **Ingress Controller**: Manages API gateway and frontend access.
- **ConfigMaps & Secrets**: Manages environment variables securely.

## Kubernetes Configuration

### Namespaces

- `rendermart`: For frontend and backend services.
- `rendermart-db`: For database services.

### ConfigMaps

- **Frontend ConfigMap (`frontend-config.yaml`)**: Contains frontend environment variables.
- **Backend ConfigMap (`backend-config.yaml`)**: Defines backend configuration such as database connection details.

### Secrets

- **PostgreSQL Secrets (`postgres-secret.yaml`)**: Stores database credentials securely.

## Deployment Guide

1. **Set up Kubernetes Cluster**  
   Ensure you have an AWS EKS cluster running.

2. **Apply Namespaces**  
   ```bash
   kubectl apply -f namespace-rendermart.yaml
   kubectl apply -f namespace-rendermart-db.yaml
   ```

3. **Deploy ConfigMaps & Secrets**  
   ```bash
   kubectl apply -f backend-config.yaml
   kubectl apply -f frontend-config.yaml
   kubectl apply -f postgres-secret.yaml
   kubectl apply -f postgres-secret-db.yaml
   ```

4. **Deploy Database (PostgreSQL)**  
   ```bash
   kubectl apply -f postgres-pvc.yaml
   kubectl apply -f postgres-statefulset.yaml
   kubectl apply -f postgres-service.yaml
   ```

5. **Deploy Backend**  
   ```bash
   kubectl apply -f backend-deployment.yaml
   kubectl apply -f backend-service.yaml
   ```

6. **Deploy Frontend**  
   ```bash
   kubectl apply -f frontend-deployment.yaml
   kubectl apply -f frontend-service.yaml
   ```

7. **Apply Ingress**  
   ```bash
   kubectl apply -f ingress.yaml
   ```

## Services Overview

### Backend Service

- Uses `backend-service.yaml` with **ClusterIP**.
- Listens on port `80` and forwards to `3300`.

### Frontend Service

- Uses `frontend-service.yaml` with **ClusterIP**.
- Listens on port `80`.

### PostgreSQL Service

- Uses `postgres-service.yaml`.
- StatefulSet ensures data persistence.

## Ingress Configuration

- Routes `/api/` traffic to backend.
- Routes `/` traffic to frontend.
- Uses AWS Application Load Balancer (ALB).

## Security Considerations

- **Secrets**: Sensitive data is stored securely.
- **Role-Based Access Control (RBAC)**: Only authorized access to Kubernetes resources.
- **Resource Limits**: Prevents excessive resource consumption.

## Scaling and Resource Management

- **Replicas**: Both frontend and backend have `replicas: 2`.
- **Requests & Limits**: Backend and frontend are allocated controlled memory and CPU usage.

## Conclusion

RenderMart is a scalable, cloud-native e-commerce platform that leverages Kubernetes, AWS, and PostgreSQL to ensure high availability and performance.


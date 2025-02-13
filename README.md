# RenderMart - AI Image Marketplace

RenderMart is a **cloud-native full-stack AI image marketplace** deployed on **AWS EKS** with **Kubernetes**. It leverages **AWS Lambda, API Gateway, Amazon Bedrock, and S3** for AI-powered image generation. The project follows a **microservices architecture** with a fully automated **CI/CD pipeline** using GitHub Actions and Skaffold.

---

## Table of Contents

1. [Features](#features)
2. [Detailed Kubernetes Cluster Architecture](#detailed-kubernetes-cluster-architecture)
    - [Namespaces](#namespaces)
    - [Core Kubernetes Objects](#core-kubernetes-objects)
      - [ConfigMaps & Secrets](#configmaps--secrets)
      - [Deployments & StatefulSets](#deployments--statefulsets)
      - [Services](#services)
      - [Ingress](#ingress)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Deployment Guide](#deployment-guide)
5. [Project Structure](#project-structure)
6. [Additional Details](#additional-details)
    - [Security Considerations](#security-considerations)
    - [Networking & Scalability](#networking--scalability)
    - [Logging & Monitoring](#logging--monitoring)
    - [Troubleshooting & Recovery](#troubleshooting--recovery)
7. [Future Improvements](#future-improvements)

---

## Features

### 1. AI-Powered Image Generation
- **Amazon Bedrock (Titan Image Generator)**: Leverages advanced AI to generate images from text prompts.
- **Serverless Invocation**: An **AWS Lambda** function triggered by **API Gateway** handles incoming image generation requests.
- **S3 Storage**: Generated images are stored in Amazon S3, with a **pre-signed URL** returned to the client for secure access.

### 2. Secure User Authentication
- **Express.js & Passport.js**: Implements secure local authentication for user sign-up, login, and session management.
- **Database-Backed Sessions**: User sessions and credentials are stored securely in the in-cluster PostgreSQL database.

### 3. Digital Wallet System
- **Asset Ownership**: Users have a personal digital wallet that stores AI-generated images.
- **Marketplace Transactions**: The wallet supports operations such as listing images for sale, purchasing images, and withdrawing assets.
- **Transactional Integrity**: All transactions are reliably recorded within PostgreSQL.

### 4. Marketplace for Buying & Selling Images
- **Real-Time Listings**: The platform supports dynamic updates of image listings.
- **Direct Transactions**: Buyers can purchase images from other users with clear transaction histories.

### 5. Cloud-Native Deployment
- **AWS EKS & Kubernetes**: Deployed as containerized microservices on a managed Kubernetes cluster.
- **Ingress via AWS ALB**: An Application Load Balancer (ALB) routes external traffic to internal services based on URL paths.

### 6. Automated CI/CD Pipeline
- **GitHub Actions**: Automates testing, building, and deployment on every push to the `main` branch.
- **Skaffold**: Simplifies building Docker images and deploying Kubernetes manifests, ensuring zero downtime via rolling updates.

---

## Detailed Kubernetes Cluster Architecture

The RenderMart Kubernetes cluster is architected for reliability, scalability, and maintainability. Below is a comprehensive breakdown of its components:

### Namespaces

- **`rendermart`**  
  Contains core application components including:
  - **Frontend**: A React-based web application built with Vite and Tailwind CSS.
  - **Backend**: An Express.js API managing authentication, business logic, and interactions with the PostgreSQL database.

- **`rendermart-db`**  
  Dedicated to database services:
  - **PostgreSQL**: Deployed as a **StatefulSet** to guarantee stable networking and persistent storage.
  - **PersistentVolumeClaim (PVC)**: Ensures that the database has reliable storage (using AWS EBS with the gp2 storage class).

### Core Kubernetes Objects

#### ConfigMaps & Secrets

- **ConfigMaps:**
  - **Backend Config (`backend-config` in `rendermart` namespace):**
    - `PORT`: The internal port for the backend (e.g., `3300`).
    - `DB_HOST`: The hostname for the PostgreSQL service (`postgres.rendermart-db.svc.cluster.local`).
    - `DB_NAME`: The database name (e.g., `rendermart`).
    - `CORS_ORIGIN`: Allowed CORS origin (typically the ALB endpoint).

  - **Frontend Config (`frontend-config` in `rendermart` namespace):**
    - `VITE_INGRESS_IP`: The endpoint URL provided by the ALB, used for API calls from the frontend.

- **Secrets:**
  - **PostgreSQL Secrets (`postgres-secret`):**
    - Defined in both `rendermart` and `rendermart-db` namespaces.
    - Contains sensitive database credentials (`POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`) in base64-encoded form.

... (truncated for brevity)

---

## Future Improvements

- **Infrastructure as Code (IaC):**  
  - Transition to Terraform for managing AWS resources and Kubernetes cluster configurations.
- **Enhanced Monitoring:**  
  - Integrate AWS CloudWatch with Prometheus and Grafana for end-to-end monitoring.
- **Auto-scaling Enhancements:**  
  - Implement Horizontal Pod Autoscalers (HPA) and Cluster Autoscaler for dynamic scaling based on load.
- **Security Audits:**  
  - Regular security audits and penetration testing to ensure the application remains secure.
- **Feature Enhancements:**  
  - Expand the digital wallet capabilities and add support for more advanced image transactions.


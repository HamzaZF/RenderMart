# RenderMart - Cloud-Native PERN Stack Application

## 📌 Introduction
RenderMart is a cloud-native web application built using the **PERN (PostgreSQL, Express, React, Node.js) stack**, designed for **scalability and high availability**. It is deployed on **AWS using Kubernetes (EKS)** and leverages **CI/CD with GitHub Actions** for automated deployments.

This project follows best practices in **Cloud Infrastructure, Kubernetes, and DevOps**, making it ideal for demonstrating cloud engineering expertise.

## 📖 Table of Contents
- [Features](#-features)
- [Cloud-Native Architecture](#-cloud-native-architecture)
- [Tech Stack](#-tech-stack)
- [Infrastructure Overview](#-infrastructure-overview)
- [Project Structure](#-project-structure)
- [Installation & Local Setup](#-installation--local-setup)
- [Cloud Deployment on AWS](#-cloud-deployment-on-aws)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Configuration & Secrets](#-configuration--secrets)
- [License](#-license)
- [Contributors](#-contributors)

---

## ✨ Features
- ✅ **Cloud-Native Deployment** - Built for **AWS EKS** (Elastic Kubernetes Service)
- ✅ **Microservices Architecture** - Separate services for **frontend, backend, and database**
- ✅ **Scalability & High Availability** - Managed via **Kubernetes StatefulSets & Deployments**
- ✅ **Load Balancing & Ingress** - **Nginx Ingress** for traffic routing
- ✅ **CI/CD Pipeline** - Automated deployments with **GitHub Actions**
- ✅ **Secrets Management** - **Kubernetes Secrets & ConfigMaps** for environment variables
- ✅ **Persistent Storage** - **PostgreSQL database with PVC (Persistent Volume Claims)**

---

## ☁️ Cloud-Native Architecture
The application is structured as a **fully containerized microservices architecture** running on **AWS EKS**:
- **Frontend** (React + Nginx) - Exposed via Ingress
- **Backend** (Node.js + Express) - Handles business logic
- **Database** (PostgreSQL) - Runs as a **StatefulSet** with Persistent Volumes
- **Ingress Controller** - Routes external traffic to services
- **CI/CD Workflow** - Automated builds & deployments using **GitHub Actions**

---

## 🛠 Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Nginx
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (StatefulSet with PVC)
- **Cloud Provider:** AWS (EKS, ALB, Route 53, S3)
- **Orchestration:** Kubernetes
- **Containerization:** Docker
- **Load Balancing:** AWS ALB + Ingress Controller
- **CI/CD:** GitHub Actions + DockerHub
- **Security & Secrets Management:** Kubernetes Secrets, ConfigMaps

---

## ☸️ Infrastructure Overview
```
AWS EKS Cluster
├── Ingress (Nginx) → Load Balancer (AWS ALB)
│   ├── Frontend (React + Nginx) [Deployment + Service]
│   ├── Backend (Node.js + Express) [Deployment + Service]
│   ├── Database (PostgreSQL) [StatefulSet + PVC]
│   ├── Secrets & ConfigMaps (for sensitive data)
│   ├── CI/CD (GitHub Actions for automation)
```

### **Kubernetes Manifests**
- `k8s/ingress.yaml` - AWS ALB for routing traffic
- `k8s/backend-deployment.yaml` - Backend Deployment & Service
- `k8s/frontend-deployment.yaml` - Frontend Deployment & Service
- `k8s/postgres-statefulset.yaml` - PostgreSQL with Persistent Storage
- `k8s/postgres-secret.yaml` - Database credentials stored securely
- `k8s/configmaps.yaml` - Configuration management

---

## 📂 Project Structure
```
rendermart/
│── backend/           # Node.js backend with Express
│   ├── index.js       # Main entry point
│   ├── package.json   # Dependencies
│   ├── Dockerfile     # Backend Dockerfile
│── frontend/          # React frontend
│   ├── src/           # React source files
│   │   ├── components/ # React components
│   ├── package.json   # Frontend dependencies
│   ├── Dockerfile     # Frontend Dockerfile
│── k8s/               # Kubernetes manifests
│   ├── ingress.yaml   # Load balancing & routing
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── postgres-statefulset.yaml
│── .github/workflows/ # CI/CD configuration
│── skaffold.yaml      # Kubernetes deployment automation
```

---

## 🛠 Installation & Local Setup

### 🔹 **1. Clone the repository**
```sh
git clone https://github.com/yourusername/rendermart.git
cd rendermart
```

### 🔹 **2. Set up environment variables**
Create `.env` files for **backend** and **frontend**.

#### Backend (`backend/.env`)
```
DATABASE_URL=your_postgresql_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```

#### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:5000
```

### 🔹 **3. Install dependencies**
```sh
cd backend && npm install
cd ../frontend && npm install
```

### 🔹 **4. Run Locally**
```sh
cd backend && npm start
cd frontend && npm run dev
```

---

## ☁️ Cloud Deployment on AWS

### 1️⃣ **Deploy to Kubernetes (EKS)**
Ensure you have:
- **AWS CLI** configured (`aws configure`)
- **kubectl** installed
- **Helm & Skaffold** for deployment automation

#### **Deploy to AWS EKS**
```sh
aws eks --region your-region update-kubeconfig --name your-cluster-name
kubectl apply -f k8s/
```

### 2️⃣ **Check Deployment**
```sh
kubectl get pods -n rendermart
kubectl get services -n rendermart
```

### 3️⃣ **Access the Application**
- The frontend will be accessible via the **AWS ALB Ingress** URL.
- Retrieve it using:
  ```sh
  kubectl get ingress -n rendermart
  ```

---

## 🚀 CI/CD Pipeline

### ✅ **GitHub Actions Workflow**
- **Automated Testing & Build**
- **Docker Image Push to DockerHub**
- **Kubernetes Deployment on AWS**

The workflow is defined in:
```
.github/workflows/main.yaml
```

### **Trigger Deployment**
Push changes to **main** branch to trigger **CI/CD pipeline**.

---

## 🔐 Configuration & Secrets

### 🔹 **Secrets Management**
- **PostgreSQL Credentials** are stored in Kubernetes **Secrets** (`postgres-secret.yaml`).
- **Environment Variables** are managed using **ConfigMaps** (`backend-config.yaml`, `frontend-config.yaml`).

### 🔹 **Persistent Storage**
- **PostgreSQL** uses a **Persistent Volume Claim (PVC)** (`postgres-pvc.yaml`).

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 🤝 Contributors
- **Your Name** - [GitHub Profile](https://github.com/yourusername)

---

## 🔗 Links
- **Live Demo:** [Your AWS Deployed App](#)
- **API Docs:** [Swagger or Postman Collection](#)
- **Report Issues:** [GitHub Issues](#)

# RenderMart - AI Image Marketplace

RenderMart is a **PERN (PostgreSQL, Express, React, Node.js) cloud-native application** deployed on **AWS EKS** with **Kubernetes**. It features **AI-powered image generation using Amazon Bedrock**, a **marketplace for digital assets**, and **CI/CD automation using GitHub Actions & Skaffold**.

---

## **Features**
✔️ Full-Stack **PERN Application**
✔️ **AWS EKS + Kubernetes Deployment**
✔️ **CI/CD with GitHub Actions & Skaffold**
✔️ **AI Image Generation with Amazon Bedrock**
✔️ **Serverless Processing with AWS Lambda + API Gateway**
✔️ **PostgreSQL StatefulSet for Persistent Storage**
✔️ **AWS ALB for Ingress Routing**
✔️ **Secure Image Storage with Amazon S3**
✔️ **Scalable Microservices Architecture**

---

## **Architecture Overview**
### **Cloud Infrastructure (AWS Services Used)**
- **EKS (Elastic Kubernetes Service)** - Manages Kubernetes workloads
- **ECR (Elastic Container Registry)** - Stores Docker images
- **ALB (Application Load Balancer)** - Routes traffic to frontend/backend
- **RDS (or self-managed PostgreSQL)** - Persistent database storage
- **S3 (Simple Storage Service)** - Stores AI-generated images
- **API Gateway + Lambda** - Handles AI image requests via Amazon Bedrock
- **IAM (Identity & Access Management)** - Manages secure access controls

### **Kubernetes Cluster Design**
- **Namespaces**
  - `rendermart` - Frontend & Backend
  - `rendermart-db` - PostgreSQL Database
- **Service Communication (DNS-based discovery)**
  - Backend: `backend-service.rendermart.svc.cluster.local`
  - Frontend: `frontend-service.rendermart.svc.cluster.local`
  - PostgreSQL: `postgres.rendermart-db.svc.cluster.local`

---

## **Deployment & CI/CD Pipeline**
### **GitHub Actions (`main.yaml`)**
🔹 **Automates Deployment to AWS EKS** on every push to `main` branch:
1️⃣ **Authenticate to AWS** via `aws-actions/configure-aws-credentials@v2`
2️⃣ **Login to Amazon ECR** for Docker image storage
3️⃣ **Install & Configure Kubectl for EKS**
4️⃣ **Install Skaffold** for Kubernetes deployment automation
5️⃣ **Deploy to Kubernetes using Skaffold** (`skaffold run`)

### **Skaffold Configuration (`skaffold.yaml`)**
- **Builds & Pushes Docker images to ECR**
- **Applies Kubernetes manifests in `k8s/`**
- **Automates Deployment with Rolling Updates**

```yaml
artifacts:
  - image: 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-backend
    context: backend
    docker:
      dockerfile: Dockerfile
  - image: 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-frontend
    context: frontend
    docker:
      dockerfile: Dockerfile
```

---

## **AI Image Generation (AWS Lambda + Bedrock + S3)**
🔹 **How it Works**:
1️⃣ **Frontend submits a prompt** for image generation
2️⃣ **API Gateway invokes AWS Lambda** (`generate_image.py`)
3️⃣ **Lambda calls Amazon Bedrock (Titan Image Generator)**
4️⃣ **Generated image is stored in Amazon S3**
5️⃣ **Pre-signed S3 URL is returned to frontend**

🔹 **Example Lambda Code (`generate_image.py`)**:
```python
response = bedrock_runtime.invoke_model(
    body=body,
    modelId=MODEL_ID
)
```

---

## **Backend API Endpoints (Node.js + Express + PostgreSQL)**
| Route | Method | Description |
|--------|--------|-------------|
| `/api/register` | POST | User Signup |
| `/api/login` | POST | User Login |
| `/api/wallet` | GET | Fetch User’s Wallet |
| `/api/wallet/list` | POST | List an Image for Sale |
| `/api/wallet/withdraw` | POST | Withdraw an Image from Sale |
| `/api/marketplace` | GET | View Marketplace Listings |
| `/api/marketplace/buy` | POST | Purchase an Image |
| `/api/history` | GET | View Transaction History |

---

## **Deployment Guide**
### **Prerequisites**
- **AWS CLI Installed & Configured**
- **Kubectl & Skaffold Installed**
- **GitHub Actions Secrets Set Up**

### **Steps**
1️⃣ **Create an EKS Cluster**
```sh
aws eks create-cluster --name rendermart-cluster --region us-east-1
```
2️⃣ **Deploy Kubernetes Resources**
```sh
kubectl apply -f k8s/
```
3️⃣ **Push Code to GitHub** (Triggers GitHub Actions CI/CD)
```sh
git push origin main
```

---

## **Repository Structure**
```bash
📂 render-mart
 ├── 📂 backend           # Express.js API (Node.js + PostgreSQL)
 ├── 📂 frontend          # React (Vite + Tailwind)
 ├── 📂 k8s               # Kubernetes Manifests
 │   ├── backend/
 │   ├── frontend/
 │   ├── postgres/
 │   ├── config/
 │   ├── ingress.yaml
 ├── 📂 lambda            # AWS Lambda Function (AI Image Gen)
 ├── 📄 Dockerfile        # Backend & Frontend Dockerfiles
 ├── 📄 skaffold.yaml     # Skaffold CI/CD Configuration
 ├── 📄 main.yaml         # GitHub Actions Workflow
 ├── 📄 README.md         # Documentation
```

---

## **Future Improvements**
🔹 **Terraform for Infrastructure as Code (IaC)**
🔹 **Enable AWS CloudWatch for Monitoring**
🔹 **Integrate Prometheus + Grafana for Metrics**

🚀 **Your cloud engineering skills are demonstrated through AWS, Kubernetes, CI/CD, and Serverless technologies. Now, let’s make your GitHub repository shine!**
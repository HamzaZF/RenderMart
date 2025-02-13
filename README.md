# RenderMart - AI Image Marketplace

RenderMart is a **cloud-native full-stack AI image marketplace** deployed on **AWS EKS** with **Kubernetes**. It leverages **AWS Lambda, API Gateway, Amazon Bedrock, and S3 for AI-powered image generation**. The project follows a **microservices architecture** with **CI/CD automation using GitHub Actions & Skaffold**.

---

## **Features**

### **1. AI-Powered Image Generation**
- Uses **Amazon Bedrock (Titan Image Generator)**
- **AWS Lambda + API Gateway** handle AI image generation requests
- Stores images securely in **Amazon S3**
- Returns **pre-signed S3 URLs** for retrieval

### **2. Secure User Authentication**
- **Express.js with Passport.js (Local Strategy)**
- **Session management in PostgreSQL**
- Users can **sign up, log in, and securely manage assets**

### **3. Digital Wallet System**
- Users **own AI-generated images** in their wallet
- Images can be **listed for sale or withdrawn**
- Uses **PostgreSQL as the transactional database**

### **4. Marketplace for Buying & Selling Images**
- **Real-time listings** for AI-generated images
- Buyers can **purchase images from other users**
- **Price setting and transaction history tracking**

### **5. Cloud-Native Deployment (AWS EKS & Kubernetes)**
- Deployed on **AWS EKS with managed Kubernetes services**
- Uses **Ingress with AWS ALB for traffic routing**
- Implements **DNS-based service discovery for pod communication**

### **6. Automated CI/CD Pipeline (GitHub Actions + Skaffold)**
- **Dockerized microservices** for frontend & backend
- **Automatic deployment to AWS EKS** on every push
- Uses **Skaffold for Kubernetes manifest automation**

---

## **Project Architecture**

### **AWS Services Used**
✅ **EKS (Elastic Kubernetes Service)** – Manages Kubernetes workloads  
✅ **ECR (Elastic Container Registry)** – Stores Docker images  
✅ **ALB (Application Load Balancer)** – Routes traffic to frontend/backend  
✅ **RDS (PostgreSQL on AWS)** – Stores user and transaction data  
✅ **S3 (Simple Storage Service)** – Stores AI-generated images  
✅ **API Gateway + Lambda** – Handles AI image requests via Amazon Bedrock  
✅ **IAM (Identity & Access Management)** – Manages secure access controls  

### **Kubernetes Cluster Design**
- **Namespaces**
  - `rendermart` - **Frontend & Backend Services**
  - `rendermart-db` - **PostgreSQL Database**
- **Pod Communication (DNS-Based Service Discovery)**
  - Backend → `backend-service.rendermart.svc.cluster.local`
  - Frontend → `frontend-service.rendermart.svc.cluster.local`
  - PostgreSQL → `postgres.rendermart-db.svc.cluster.local`

---

## **Deployment & CI/CD Pipeline**

### **GitHub Actions (`main.yaml`)**
This workflow automates deployment to **AWS EKS** whenever code is pushed to the `main` branch.

🔹 **Key Steps:**
1️⃣ Authenticate to AWS via `aws-actions/configure-aws-credentials@v2`  
2️⃣ Log in to Amazon ECR and push Docker images  
3️⃣ Install & configure **Kubectl for EKS**  
4️⃣ Install **Skaffold for Kubernetes deployment automation**  
5️⃣ Deploy using **Skaffold run**  

### **Skaffold Configuration (`skaffold.yaml`)**
- Builds & pushes **Docker images to ECR**
- Applies **Kubernetes manifests in `k8s/`**
- Automates **rolling updates**

```yaml
artifacts:
  - image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rendermart-backend
    context: backend
    docker:
      dockerfile: Dockerfile
  - image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rendermart-frontend
    context: frontend
    docker:
      dockerfile: Dockerfile
```

---

## **AI Image Generation (AWS Lambda + Bedrock + S3)**

### **How It Works:**
1️⃣ **User submits a text prompt** via the frontend  
2️⃣ **API Gateway invokes AWS Lambda** (`generate_image.py`)  
3️⃣ **Lambda calls Amazon Bedrock (Titan Image Generator)**  
4️⃣ **Generated image is stored in Amazon S3**  
5️⃣ **Pre-signed S3 URL is returned for retrieval**  

### **Lambda Code Example (`generate_image.py`)**
```python
response = bedrock_runtime.invoke_model(
    body=body,
    modelId=MODEL_ID
)
```

---

## **Backend API Endpoints (Express + PostgreSQL)**

| Route | Method | Description |
|--------|--------|-------------|
| `/api/register` | POST | User Signup |
| `/api/login` | POST | User Login |
| `/api/wallet` | GET | Fetch user wallet |
| `/api/wallet/list` | POST | List an image for sale |
| `/api/wallet/withdraw` | POST | Withdraw an image |
| `/api/marketplace` | GET | View marketplace listings |
| `/api/marketplace/buy` | POST | Buy an image |
| `/api/history` | GET | View transaction history |

---

## **Deployment Guide**

### **Prerequisites**
✅ AWS CLI Installed & Configured  
✅ Kubectl & Skaffold Installed  
✅ GitHub Actions Secrets Configured  

### **Deployment Steps**
1️⃣ **Create an EKS Cluster**
```sh
aws eks create-cluster --name rendermart-cluster --region us-east-1
```
2️⃣ **Deploy Kubernetes Manifests**
```sh
kubectl apply -f k8s/
```
3️⃣ **Push Code to GitHub** (Triggers CI/CD Deployment)
```sh
git push origin main
```

---

## **Project Structure**
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
✅ **Terraform for Infrastructure as Code (IaC)**  
✅ **Enable AWS CloudWatch for Monitoring**  
✅ **Integrate Prometheus + Grafana for Metrics**  
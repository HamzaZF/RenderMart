# RenderMart - AI Image Generation Platform

RenderMart is a **cloud-native platform** that allows users to **generate AI-based images**.

---

## 🚀 Key Features

### 🎨 AI Image Generation
- Utilizes **AWS Bedrock** to generate high-quality images.
- Customizable images based on user preferences.

### ☁️ Cloud Storage and Accessibility
- **Stores images on AWS S3** for optimal accessibility and scalability.
- **API Gateway and AWS Lambda** securely expose image generation and management features.

### 🏗️ Microservices Architecture
- **Backend**: REST API developed with **Node.js & Express**.
- **Frontend**: Modern user interface with **React.js & Vite**.
- **Database**: PostgreSQL with persistent storage.
- **Internal Communication**: Uses **Kubernetes Services and Ingress Controller** for connectivity.

### ☁️ Cloud-Native Deployment and Scalability
- Containerization with **Docker** for simplified service management.
- Orchestration and resource management with **Kubernetes**.
- Traffic management using **AWS Load Balancer Controller**.
- Automated builds and deployments with **GitHub Actions** and **Skaffold**.

---

## 🛠️ Technologies Used

### 🌍 Cloud & Storage
- **AWS S3** (Storage for generated images)
- **AWS Lambda** (Serverless function execution)
- **API Gateway** (Access and endpoint management)
- **AWS EKS** (Container orchestration)
- **AWS ECR** (Registry for storing Docker images)

### 🏗️ Orchestration & Containerization
- **Kubernetes** (Microservices orchestration)
- **Docker** (Service containerization)

### 🖥️ Backend
- **Node.js** (Backend server execution)
- **Express.js** (REST API framework)
- **PostgreSQL** (Relational database)

### 🎨 Frontend
- **React.js** (UI framework)
- **Vite** (Frontend optimization)
- **TailwindCSS** (CSS framework)
- **Nginx** (Frontend server)

### ⚙️ CI/CD and Automation
- **GitHub Actions** (Automated builds and tests)
- **Skaffold** (Automated deployment on Kubernetes)
- **Helm** (Kubernetes component management)

---

## 🏗️ Deployment and Required Tools

RenderMart is designed for deployment on **AWS** and requires the following tools:

| Tool | Role |
|---|---|
| `eksctl` | Creates and manages the EKS cluster |
| `kubectl` | Interacts with Kubernetes |
| `helm` | Installs components (Ingress, Load Balancer, etc.) |
| `skaffold` | Automates builds and deployment |
| `aws-cli` | Manages AWS resources |
| `docker` | Creates and manages containers |

> **Note**: Before starting, ensure these tools are installed and properly configured.

---

## 📁 Kubernetes - Configuration Files Explanation

The **RenderMart** architecture relies on Kubernetes to ensure service resilience and scalability. Below are the key Kubernetes files and their roles.

### 📌 Ingress Controller (`ingress.yaml`)

Defines routing rules to direct traffic to internal application services.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
  namespace: rendermart
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb
  rules:
    - http:
        paths:
          - path: /api/ # All requests starting with /api go to the backend
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 80

          - path: / # Everything else goes to the frontend
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

- Exposes the frontend and backend via an **AWS Load Balancer**.
- Routes `/api/` to the backend and `/` to the frontend.

### 🔹 Backend Deployment (`backend-deployment.yaml`)

Describes how the backend is deployed as **replicated pods**.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: rendermart
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
          image: 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-backend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3300
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: postgres-secret
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"
```

- Runs the backend Docker image stored in **ECR**.
- Creates **2 replicas** to ensure availability.

---

### 📞 Support

If you have any questions, open an issue or contact us at `support@rendermart.com`.

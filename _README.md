# RenderMart - AI Image Generation Platform

RenderMart is a **cloud-native platform** that empowers users to create **AI-generated images** and **monetize them** through a built-in **marketplace**.

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

### ⚙️ CI/CD and Automation
- **GitHub Actions** (Automated builds and tests)
- **Skaffold** (Automated deployment on Kubernetes)
- **Helm** (Kubernetes component management)

### 🖥️ Backend
- **Node.js** (Backend server execution)
- **Express.js** (REST API framework)
- **PostgreSQL** (Relational database)

### 🎨 Frontend
- **React.js** (UI framework)
- **Vite** (Frontend optimization)
- **TailwindCSS** (CSS framework)
- **Nginx** (Frontend server)

---

## ⚙️ Kubernetes Cluster Architecture & Configuration

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
- Define access on **port 4000**.

## 🔹 Backend Service (`backend-service.yaml`)

Exposes the backend inside the Kubernetes cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: rendermart
spec:
  selector:
    app: backend
  type: ClusterIP
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3300
```

- Defines a **Kubernetes Service** in `ClusterIP` mode.
- Allows other internal services to access the backend.

## 🔹 Frontend Deployment (`frontend-deployment.yaml`)

Describes the frontend deployment.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: rendermart
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-frontend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 80
          envFrom:
            - configMapRef:
                name: frontend-config
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"
```

- Deploys the frontend Docker image stored in **ECR**.
- Runs the **Nginx** server to serve the user interface.
- Defines **2 replicas** for high availability.

## 🔹 Frontend Service (`frontend-service.yaml`)

Exposes the frontend to be accessible via **Ingress**.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: rendermart
spec:
  ports:
    - port: 80
      targetPort: 80
  selector:
    app: frontend
  type: ClusterIP
```

- Defines a **Kubernetes Service** for the frontend.
- Ensures communication between the frontend and the Load Balancer.

## 🗄️ PostgreSQL StatefulSet (`postgres-statefulset.yaml`)

Defines the PostgreSQL database using a **StatefulSet** to ensure data persistence.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: rendermart-db
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      nodeSelector:
        eks.amazonaws.com/nodegroup: efs-nodegroup
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          envFrom:
            - secretRef:
                name: postgres-secret
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
              subPath: postgres
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
```

- Ensures PostgreSQL retains its data even after a restart.
- Associates a **Persistent Volume** based on **EBS CSI**.
- Defines a **10Gi** storage request for the database.

## 🔹 PostgreSQL Service (`postgres-service.yaml`)

Exposes PostgreSQL within the cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: rendermart-db
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
  clusterIP: None
```

- Defines a **Kubernetes Service** that allows the backend to access PostgreSQL.
- Works in `ClusterIP` mode for secure internal communication.

---

## License

This project is licensed under the MIT License.
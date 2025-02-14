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

# Rendermart Deployment Guide

## 1. Set AWS Credentials

Ensure your AWS CLI is configured correctly:

```sh
aws configure
```

## 2. Create & Configure the EKS Cluster

Set up an Amazon EKS cluster with Fargate:

```sh
eksctl create cluster --name rendermart --region <AWS_REGION> --fargate
aws eks update-kubeconfig --name rendermart --region <AWS_REGION>
eksctl utils associate-iam-oidc-provider --cluster rendermart --approve
```

Install AWS Load Balancer Controller

```sh
eksctl create iamserviceaccount --cluster=rendermart --namespace=kube-system --name=aws-load-balancer-controller --role-name aws-load-balancer-controller-role --attach-policy-arn=arn:aws:iam::<AWS_ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy --approve
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=rendermart --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller --set region=<AWS_REGION> --set vpcId=<VPC_ID>
```

Configure Storage & Nodes

```sh
eksctl create fargateprofile --cluster rendermart --region <AWS_REGION> --name fargate-profile-rendermart --namespace rendermart --selector
eksctl create iamserviceaccount --region <AWS_REGION> --name ebs-csi-controller-sa --namespace kube-system --cluster rendermart --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy --approve --role-only --role-name AmazonEKS_EBS_CSI_DriverRole
eksctl create addon --name aws-ebs-csi-driver --cluster rendermart --service-account-role-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/AmazonEKS_EBS_CSI_DriverRole --force
eksctl create nodegroup --cluster rendermart --name efs-nodegroup --node-type t3.large --nodes 2 --nodes-min 1 --nodes-max 3 --node-volume-size 20 --region <AWS_REGION>
```

## 3. Create & Configure ECR

Create repositories for storing Docker images:

```sh
aws ecr create-repository --repository-name rendermart-backend
aws ecr create-repository --repository-name rendermart-frontend
```

Update the following files:

- **`skaffold.yaml`**: Replace the old Docker image references with the newly created ECR repository URLs.
- **`k8s/frontend/frontend-deployment.yaml`**: Update the `image` field to point to the correct frontend ECR repository.
- **`k8s/backend/backend-deployment.yaml`**: Modify the `image` field to use the new backend ECR repository URL.
- **`k8s/backend/backend-config.yaml`**: Set the correct `CORS_ORIGIN` to match the generated Ingress IP once it is retrieved.

## 4. Configure S3 Bucket

Create a public S3 bucket:

```sh
aws s3api create-bucket --bucket rendermart-images-bucket --region <AWS_REGION> --acl public-read
```

Apply the bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::rendermart-images-bucket/*"
    }
  ]
}
```

## 5. Set Up Lambda & Bedrock

1. Create an API Gateway (POST HTTP) and configure CORS.
2. Deploy a Lambda function that integrates with Bedrock’s `amazon.titan-image-generator-v1` model. The code for this Lambda function can be found in the `lambda/` folder.
3. Increase Lambda timeout to at least 1 minute to generate images.
4. Create a Lambda role with the following policies:
   - `AmazonBedrockFullAccess`
   - `AmazonS3FullAccess`
   - `AWSLambdaBasicExecutionRole`
5. Retrieve API Gateway URL:
   ```sh
   kubectl get ingress -n rendermart
   ```

6. Update `AWS_LAMBDA_API` in `/frontend/.env` with the value retrieved in step 5.

## 6. Build & Push Docker Images

Authenticate and push images to ECR:

```sh
aws ecr get-login-password | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com
```

Build & Push backend image

```sh
docker build -t <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/rendermart-backend:latest .
docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/rendermart-backend:latest
```

Build & Push frontend image

```sh
docker build -t <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/rendermart-frontend:latest .
docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/rendermart-frontend:latest
```

## 7. Deploy Kubernetes Manifests

Apply configurations in the correct order:

```sh
kubectl apply -f ./namespace-rendermart.yaml
kubectl apply -f ./ingress.yaml
kubectl get ingress -n rendermart # Retrieve the Ingress address
```

Update the frontend `.env` file and backend-config.yaml with the Ingress IP.

```sh
kubectl apply -f ./namespace-rendermart-db.yaml
```

Then, deploy the remaining Kubernetes manifests in order:

```sh
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
```

## 8. Automate Deployment with Skaffold

Skaffold can be used to build and deploy updates seamlessly. For new deployments, you can run the following command:

```sh
skaffold run
```

For subsequent updates to the code, Skaffold can automatically build and deploy the latest changes without manually rebuilding Docker images and applying Kubernetes manifests.

## 9. Configure GitHub Actions

To enable automated builds and deployments, configure the following GitHub Secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_REGION`
- `AWS_SECRET_ACCESS_KEY`
- `EKS_CLUSTER_NAME`

Additionally, update the `workflow main.yaml` file to reference your ECR repository link. Once configured, every new commit will trigger GitHub Actions to build and deploy the latest version of your application automatically.


# License

This project is licensed under the MIT License.
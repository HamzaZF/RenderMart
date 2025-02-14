# Rendermart Deployment Guide

## 1. Set AWS Credentials

Ensure your AWS CLI is configured correctly:

```sh
aws configure
```

## 2. Create & Configure the EKS Cluster

### Set up an Amazon EKS cluster with Fargate:

```sh
eksctl create cluster --name rendermart --region us-east-1 --fargate
aws eks update-kubeconfig --name rendermart --region us-east-1
eksctl utils associate-iam-oidc-provider --cluster rendermart --approve
```

### Install AWS Load Balancer Controller

```sh
eksctl create iamserviceaccount --cluster=rendermart --namespace=kube-system --name=aws-load-balancer-controller --role-name aws-load-balancer-controller-role --attach-policy-arn=arn:aws:iam::061039783359:policy/AWSLoadBalancerControllerIAMPolicy --approve
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=rendermart --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller --set region=us-east-1 --set vpcId=vpc-027b19cc3fb3bd0ec
```

### Configure Storage & Nodes

```sh
eksctl create fargateprofile --cluster rendermart --region us-east-1 --name fargate-profile-rendermart --namespace rendermart --selector
eksctl create iamserviceaccount --region us-east-1 --name ebs-csi-controller-sa --namespace kube-system --cluster rendermart --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy --approve --role-only --role-name AmazonEKS_EBS_CSI_DriverRole
eksctl create addon --name aws-ebs-csi-driver --cluster rendermart --service-account-role-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/AmazonEKS_EBS_CSI_DriverRole --force
eksctl create nodegroup --cluster rendermart --name efs-nodegroup --node-type t3.large --nodes 2 --nodes-min 1 --nodes-max 3 --node-volume-size 20 --region us-east-1
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
aws s3api create-bucket --bucket rendermart-images-bucket --region us-east-1 --acl public-read
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

### Steps via AWS Console

1. **Create an API Gateway (POST HTTP)** and configure CORS.
2. **Deploy a Lambda function** that integrates with Bedrock’s `amazon.titan-image-generator-v1` model. The code for this Lambda function can be found in the `lambda/` folder.
3. **Extend the Lambda timeout** to a minimum of **1 minute** to ensure sufficient time for image generation.
4. **Create a Lambda role** with the following policies:
   - `AmazonBedrockFullAccess`
   - `AmazonS3FullAccess`
   - `AWSLambdaBasicExecutionRole`
5. **Retrieve API Gateway URL**:
   ```sh
   kubectl get ingress -n rendermart
   ```
6. Update `AWS_LAMBDA_API` in `/frontend/.env` with the value retrieved in step 5.

## 6. Build & Push Docker Images

### Authenticate to ECR:

```sh
aws ecr get-login-password | docker login --username AWS --password-stdin 061039783359.dkr.ecr.us-east-1.amazonaws.com
```

### Build & Push backend image

```sh
docker build -t 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-backend:latest .
docker push 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-backend:latest
```

### Build & Push frontend image

```sh
docker build -t 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-frontend:latest .
docker push 061039783359.dkr.ecr.us-east-1.amazonaws.com/rendermart-frontend:latest
```

## 7. Deploy Kubernetes Manifests

### Apply namespaces and ingress resources

```sh
kubectl apply -f ./namespace-rendermart.yaml
kubectl apply -f ./ingress.yaml
kubectl get ingress -n rendermart # Retrieve the Ingress address
```

### Update the frontend `.env` file and backend-config.yaml with the Ingress IP

```sh
kubectl apply -f ./namespace-rendermart-db.yaml
```

### Deploy the remaining Kubernetes manifests

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

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_REGION`: The AWS region where your cluster is deployed.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
- `EKS_CLUSTER_NAME`: The name of your Amazon EKS cluster.

Additionally, update the `workflow main.yaml` file to reference your ECR repository link. Once configured, every new commit will trigger GitHub Actions to build and deploy the latest version of your application automatically.

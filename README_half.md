# Kubernetes Deployment Configuration

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

- Deploys the frontend Docker image (stored in **ECR**).
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

## 📞 Support

If you have any questions, open an issue or contact us at `support@rendermart.com`.

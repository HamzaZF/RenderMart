# RenderMart - Plateforme de Génération d'Images IA

RenderMart est une **plateforme cloud-native** qui permet aux utilisateurs de **générer des images basées sur l'intelligence artificielle**.

---

## 📁 Manifests Kubernetes - Architecture et Explication

L’architecture de **RenderMart** repose sur **Kubernetes** pour orchestrer ses composants. Chaque fichier manifest définit un élément clé du système.

### 📌 1. Ingress Controller (`ingress.yaml`)

**Rôle :**  
L’Ingress Controller permet de gérer le routage des requêtes entre les services internes (backend et frontend). Il assure la **gestion des entrées** vers l'application et l'intégration avec le **AWS Load Balancer Controller**.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rendermart-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api/
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 4000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

🔹 **Pourquoi est-ce important ?**  
- Redirige `/api/` vers le backend et `/` vers le frontend.
- Permet d’exposer l’application au public via un Load Balancer AWS.

---

### 🔹 2. Backend Deployment (`backend-deployment.yaml`)

**Rôle :**  
Ce fichier définit le déploiement du backend sous forme de **pods répliqués** dans Kubernetes.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
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
        image: <AWS_ECR_BACKEND_IMAGE>
        ports:
        - containerPort: 4000
```

🔹 **Pourquoi est-ce important ?**  
- Crée **2 replicas** du backend pour la haute disponibilité.
- Stocke l’image Docker du backend dans **AWS ECR**.
- Définit un **service Kubernetes** qui permet aux autres composants de communiquer avec lui.

---

### 🔹 3. Backend Service (`backend-service.yaml`)

**Rôle :**  
Le service expose le backend à l’intérieur du cluster et permet la communication avec d’autres composants (Ingress, Frontend, Base de données).

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: ClusterIP
```

🔹 **Pourquoi est-ce important ?**  
- Crée un point d'accès stable pour le backend.
- Permet aux autres services de communiquer avec le backend via `backend-service:4000`.

---

### 🔹 4. Frontend Deployment (`frontend-deployment.yaml`)

**Rôle :**  
Ce fichier définit le déploiement du frontend en tant que pods dans Kubernetes.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
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
        image: <AWS_ECR_FRONTEND_IMAGE>
        ports:
        - containerPort: 80
```

🔹 **Pourquoi est-ce important ?**  
- Déploie **2 instances** du frontend.
- Utilise **Nginx** pour servir les fichiers statiques.
- Intègre l’application React au système Kubernetes.

---

### 🔹 5. Frontend Service (`frontend-service.yaml`)

**Rôle :**  
Le service expose le frontend au sein du cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

🔹 **Pourquoi est-ce important ?**  
- Permet aux autres services (Ingress) d’accéder au frontend via `frontend-service:80`.

---

### 🗄️ 6. PostgreSQL StatefulSet (`postgres-statefulset.yaml`)

**Rôle :**  
Déploie la base de données PostgreSQL en mode **StatefulSet** pour garantir un stockage persistant.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-db
spec:
  serviceName: "postgres"
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:latest
        ports:
        - containerPort: 5432
        volumeMounts:
        - mountPath: /var/lib/postgresql/data
          name: postgres-storage
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "gp2"
      resources:
        requests:
          storage: 10Gi
```

🔹 **Pourquoi est-ce important ?**  
- **StatefulSet** permet de conserver les données même si le pod redémarre.
- Stocke les données sur un **EBS CSI Driver**.
- Utilise un **volume persistent** de **10Gi** pour éviter la perte des données.

---

### 🔹 7. PostgreSQL Service (`postgres-service.yaml`)

**Rôle :**  
Permet aux applications de se connecter à la base de données.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
  type: ClusterIP
```

🔹 **Pourquoi est-ce important ?**  
- Fournit un point d’entrée stable pour la base de données.
- Permet aux pods backend de communiquer avec PostgreSQL via `postgres-service:5432`.

---

## 🎯 Conclusion

Ces **manifests Kubernetes** assurent une architecture **modulaire** et **scalable**, facilitant la gestion des microservices.

| **Manifest** | **Rôle** |
|---|---|
| `ingress.yaml` | Gestion du routage et Load Balancer |
| `backend-deployment.yaml` | Déploiement du backend |
| `backend-service.yaml` | Exposition du backend dans le cluster |
| `frontend-deployment.yaml` | Déploiement du frontend |
| `frontend-service.yaml` | Exposition du frontend dans le cluster |
| `postgres-statefulset.yaml` | Déploiement de PostgreSQL avec stockage persistant |
| `postgres-service.yaml` | Service permettant l’accès à PostgreSQL |

Grâce à cette architecture **cloud-native**, **RenderMart** peut évoluer et gérer efficacement les charges variables.

---

## 📞 Support

Si vous avez des questions, ouvrez une issue ou contactez-nous à `support@rendermart.com`.


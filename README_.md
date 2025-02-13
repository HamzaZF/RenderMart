# RenderMart

## 📌 Introduction
RenderMart is a full-stack web application built using the **PERN (PostgreSQL, Express, React, Node.js) stack**, with Kubernetes for deployment and GitHub Actions for CI/CD. The application provides a marketplace for users to generate and trade digital assets.

## 📖 Table of Contents
- [Introduction](#-introduction)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features
- 🔹 **User Authentication** - Sign up, login, and manage profiles.
- 🔹 **Marketplace** - Buy, sell, and trade digital assets.
- 🔹 **Wallet Integration** - Manage funds and transactions.
- 🔹 **Dashboard** - View analytics and transaction history.
- 🔹 **Kubernetes Deployment** - Uses **Skaffold** for Kubernetes workflows.
- 🔹 **CI/CD Pipeline** - Integrated with **GitHub Actions** for automated deployments.

---

## 🛠 Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Containerization:** Docker
- **Orchestration:** Kubernetes (Skaffold)
- **CI/CD:** GitHub Actions
- **Web Server:** Nginx

---

## 📂 Project Structure
```
rendermart/
│── backend/          # Node.js backend with Express
│   ├── index.js      # Main entry point
│   ├── package.json  # Dependencies
│   ├── Dockerfile    # Backend Dockerfile
│── frontend/         # React frontend
│   ├── src/         # React source files
│   │   ├── components/ # React components
│   ├── package.json  # Frontend dependencies
│   ├── Dockerfile    # Frontend Dockerfile
│── skaffold.yaml     # Kubernetes deployment configuration
│── .github/workflows/main.yaml # CI/CD Pipeline
```

---

## 🛠 Installation

### 🔹 **1. Clone the repository**
```sh
git clone https://github.com/yourusername/rendermart.git
cd rendermart
```

### 🔹 **2. Set up environment variables**
Create a `.env` file inside both **backend/** and **frontend/** directories and configure them:

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
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🚀 Usage

### 🔹 **Run the Backend**
```sh
cd backend
npm start
```
Backend will start at `http://localhost:5000`.

### 🔹 **Run the Frontend**
```sh
cd frontend
npm run dev
```
Frontend will start at `http://localhost:5173`.

---

## ⚙️ Configuration

- Update the database URL in **backend/.env**
- Modify frontend API base URL in **frontend/.env**
- Adjust Nginx settings in **frontend/nginx.conf** if needed.

---

## 🚢 Deployment

### 🐳 **Using Docker**
#### 1️⃣ **Build and run the containers**
```sh
docker-compose up --build
```

### ☸️ **Using Kubernetes (Skaffold)**
#### 1️⃣ **Ensure you have Skaffold installed**
```sh
skaffold version
```
#### 2️⃣ **Deploy the application**
```sh
skaffold dev
```

### 🚀 **CI/CD with GitHub Actions**
- The `.github/workflows/main.yaml` file is set up for automated deployment.
- Ensure your repository is configured with proper secrets (e.g., `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD`).

---

## 📜 License
This project is licensed under the MIT License.

---

## 🤝 Contributors
- **Your Name** - [GitHub Profile](https://github.com/yourusername)
- **Other Contributors** - List here

---

## 🔗 Links
- **Live Demo:** [Your Deployed App URL](#)
- **API Docs:** [Swagger or Postman Collection](#)
- **Report Issues:** [GitHub Issues](#)

---

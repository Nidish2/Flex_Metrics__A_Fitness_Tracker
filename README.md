# Flex Metrics - High-Performance Fitness Tracker

Flex Metrics is a premium, high-performance personal fitness, workout, and nutrition tracking web application. It features real-time workout tracking, holographic 3D muscle filters, OpenFoodFacts product scanning, and dynamic dark/light mode visual analytics.

---

## 📋 Prerequisites

Before setting up Flex Metrics, ensure you have the following installed on your local machine:

1. **Java Development Kit (JDK 21)**
   - Download: [Oracle JDK 21](https://www.oracle.com/java/technologies/downloads/#java21) or [Eclipse Temurin OpenJDK 21](https://adoptium.net/temurin/releases/?version=21)
   - Verification: `java -version`
2. **Node.js (v18.0 or higher)**
   - Download: [Node.js Official Downloads](https://nodejs.org/en/download/)
   - Verification: `node -v`
3. **Maven 3.9+** (Optional: A standalone wrapper `./mvnw` is packaged inside the backend repository).
4. **Git**
   - Download: [Git SCM](https://git-scm.com/)
   - Verification: `git --version`

---

## 🚀 Tech Stack

### Backend (Java / Spring Boot)
- **Framework**: Spring Boot 3.4.1 (Java 21)
- **Security**: Spring Security with stateless JWT Authentication
- **Database**: PostgreSQL (production) / H2 Database (local development)
- **Migrations**: Flyway Schema Migration Tool
- **Persistence**: Spring Data JPA & Hibernate

### Frontend (React / TypeScript)
- **Bundler**: Vite & React 18 (TypeScript)
- **Styling**: Tailwind CSS & Glassmorphism design system
- **3D Graphics**: React Three Fiber & Three.js (Holographic Biometric Scanner)
- **Data Visualization**: Recharts (Weight Tracking Line Charts, Macros Bar Charts)
- **State Management**: Zustand (UI State, Timer persistence)
- **Toast Notifications**: Sonner (Theme-aligned notifications)

---

## 📂 Project Structure

```
├── backend/                  # Spring Boot 3.4 Application
│   ├── src/main/java/        # Modules (Auth, User, Workouts, Nutrition)
│   ├── src/main/resources/   # Migration scripts & application.yml properties
│   ├── .env.example          # Environment variables template for backend
│   └── pom.xml               # Maven configuration
│
├── frontend/                 # React & Vite client
│   ├── public/               # Static assets & favicons
│   ├── src/
│   │   ├── components/       # Global components (MainLayout, UI controls)
│   │   ├── config/           # API Client (Axios interceptors)
│   │   ├── features/         # Modular features (Workouts, Nutrition, Profile)
│   │   ├── pages/            # Page templates (Dashboard)
│   │   ├── store/            # Zustand global UI & Auth stores
│   │   └── App.tsx           # Page Routing and guards
│   ├── .env.example          # Environment variables template for frontend
│   └── package.json          # Node dependencies
```

---

## 🌐 External APIs Setup

Flex Metrics integrates the OpenFoodFacts API to allow users to search products and fetch real-time macronutrient values.

* **API Link**: [OpenFoodFacts API Documentation](https://world.openfoodfacts.org/data)
* **Access**: Free public API (no API key required).
* **Usage**: Used inside the **Log New Meal** catalog tab to scan barcode queries or product names.

---

## 🛠️ Step-by-Step Setup Guide

### 📦 Step 1: Clone the Repository
```bash
git clone https://github.com/Nidish2/Flex_Metrics__A_Fitness_Tracker.git
cd Flex_Metrics__A_Fitness_Tracker
```

---

### ☕ Step 2: Configure & Start the Backend

#### 1. Configure environment variables
The backend repository contains a `backend/.env.example` template file. To configure your database settings, JWT secrets, and allowed origins:
- Copy the template file to create a new `.env` file inside the `backend` folder:
  ```bash
  # Inside backend/ folder
  cp .env.example .env
  ```
- Open `.env` and fill out the required variables (e.g. database credentials, JWT secret key, and CORS domains).

#### 2. Run Database Migrations & Start Server
Execute the Spring Boot runner command inside the `backend` folder:
```bash
# Navigate to the backend folder
cd backend

# On Windows PowerShell / Command Prompt
./mvnw spring-boot:run

# On Linux / macOS
chmod +x mvnw
./mvnw spring-boot:run
```
*Verification: Open your browser to `http://localhost:8080/api/v1/health` or verify console shows `Started BackendApplication`.*

#### 3. Build & Package JAR for Production
To compile and bundle the backend into a single runnable fat JAR:
```bash
./mvnw clean package
```
*The output package will be generated inside the `target/` directory.*

---

### 💻 Step 3: Configure & Start the Frontend

#### 1. Navigate to the client folder
```bash
# From project root
cd frontend
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Configure environment variables
The frontend repository contains a `frontend/.env.example` template file:
- Copy the template file to create a `.env` configuration file:
  ```bash
  cp .env.example .env
  ```
- Open the `.env` file and verify or change the `VITE_API_BASE_URL` pointing to your running backend API.

#### 4. Run the Client Dev Server
Start the local hot-reloaded development environment:
```bash
npm run dev
```
*Open your browser and navigate to `http://localhost:5173` to launch the application!*

#### 5. Compile and Build for Production
To bundle the React app into static optimized HTML/JS/CSS assets:
```bash
npm run build
```
*Static production bundles are output to the `frontend/dist/` directory.*

---

## ✨ Features Walkthrough

1. **3D Biometric Muscle Filter**: Rotate and interact with a sci-fi biometric human mesh to filter exercise categories.
2. **Dynamic Dashboard**: Monitor your daily calorie progress bars and body weight trend lines.
3. **Weight Logs in Profile**: Log and update body metrics directly from your Profile settings page.
4. **Food Log & Scanning**: Log items manually or search OpenFoodFacts with instant theme-aligned feedback.

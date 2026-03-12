# BluClinic Healthcare Portal

**BluClinic** is a multi-layered healthcare management system designed to streamline clinical operations, patient management, and administrative workflows. This portal serves as a centralized hub for healthcare providers to manage patient data, appointments, and medical histories securely and efficiently.

---

## 🚀 Features

* **Patient Management:** Register patients, track demographics (including age group categorization), and maintain medical histories.
* **Administrative Dashboard:** Comprehensive overview for admins to manage users, reset accounts, and monitor system health.
* **Role-Based Access Control (RBAC):** Secure access levels for Doctors, Nurses, and Administrators.
* **Responsive UI:** A clean, modern interface built for both desktop and mobile clinic environments.
* **Database Integration:** Scalable backend for persistent storage of sensitive medical records.

---

## 🏗 Architecture

The project follows a modern full-stack architecture to ensure scalability and ease of deployment in containerized environments like OpenShift.

* **Frontend:** React.js / Vue.js (Modular UI components)
* **Backend:** Node.js / Python (RESTful API)
* **Database:** PostgreSQL / MongoDB
* **Infrastructure:** Optimized for Linux-based environments and Red Hat OpenShift orchestration.

---

## 🛠 Getting Started

### Prerequisites

* **Node.js** (v18+ recommended)
* **Docker** (for containerized local development)
* **Git**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/bluclinic.git](https://github.com/your-username/bluclinic.git)
    cd bluclinic
    ```

2.  **Install Dependencies:**
    ```bash
    # Install backend dependencies
    cd backend && npm install
    
    # Install frontend dependencies
    cd ../frontend && npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your configurations:
    ```env
    DB_URL=mongodb://localhost:27017/bluclinic
    PORT=5000
    JWT_SECRET=your_super_secret_key
    ```

4.  **Run Locally:**
    ```bash
    # Start the backend
    npm run dev:server
    
    # Start the frontend
    npm run dev:client
    ```

---

## 🐳 Deployment (OpenShift/Kubernetes)

This application is designed to be container-native. To deploy on OpenShift:

1.  **Build the Image:**
    ```bash
    oc new-build --binary --name=bluclinic-app
    oc start-build bluclinic-app --from-dir=. --follow
    ```

2.  **Deploy:**
    ```bash
    oc new-app bluclinic-app
    oc expose svc/bluclinic-app
    ```

---

## 🔒 Security & Hardening

* **Input Validation:** All patient data is sanitized to prevent SQL injection and XSS.
* **Authentication:** Secured via JWT (JSON Web Tokens).
* **Production Hardening:** Recommended deployment behind a reverse proxy (Nginx) with SSL termination and network policies.

---

## 🤝 Contributing

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

**Project Lead:** Jonah Irande  
**Company:** BluDive Technologies
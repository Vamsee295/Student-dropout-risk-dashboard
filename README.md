# 🎓 EduRisk: AI-Powered Student Dropout Risk Prediction Platform

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.13-3776ab.svg?logo=python)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?logo=docker)

EduRisk is a full-stack, AI-driven educational analytics platform designed to proactively identify students at risk of dropping out. It provides real-time dashboards for students, faculty, and deans, leveraging Machine Learning to offer explainable risk scores and personalized intervention recommendations.

## ✨ Features

- **RBAC Authentication**: Secure JWT-based access control with distinct personas (Student, Faculty, Dean).
- **AI Prediction Engine**: Random Forest ML model predicting dropout risk based on academic and behavioral data.
- **Explainable AI (XAI)**: SHAP integration to provide transparent reasons for high-risk scores.
- **Real-Time Updates**: WebSocket integration for instant notification deliveries and dashboard updates.
- **Intervention Management**: Workflow tools for faculty to log, track, and evaluate student interventions.
- **Automated Reporting**: Export comprehensive analytics in PDF or Excel formats.
- **Production Ready**: Fully containerized using Docker, with CI/CD GitHub Actions and an Nginx reverse proxy.

## 🏗 Architecture

The platform utilizes a modern service-oriented architecture:
- **Frontend**: Next.js (React 19) + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python) + SQLAlchemy ORM
- **Database**: MySQL 8.0
- **Machine Learning**: Scikit-learn + Pandas + NumPy + Joblib
- **DevOps**: Docker + GitHub Actions + Nginx

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (if running frontend outside Docker)
- Python 3.10+ (if running backend outside Docker)

### Run with Docker Compose (Recommended)
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Student-Dropout-Risk-Dashboard.git
   cd Student-Dropout-Risk-Dashboard
   ```
2. Copy environment templates:
   ```bash
   cp .env.development .env
   ```
3. Spin up the cluster:
   ```bash
   docker-compose up -d --build
   ```
4. Access the application:
   - **Frontend**: http://localhost:3000 (or http://localhost via Nginx)
   - **Backend API Docs**: http://localhost/api/v1/docs

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:
- [Software Requirements Specification (SRS)](docs/SRS.md)
- [Software Design Document (SDD)](docs/SDD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Documentation](docs/DATABASE.md)
- [API Reference](docs/API_REFERENCE.md)
- [User Guide](docs/USER_GUIDE.md)
- [Administrator Guide](docs/ADMIN_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
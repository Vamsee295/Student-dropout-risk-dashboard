# Viva & Interview Preparation

This document contains model answers for technical interviews or academic viva questions regarding the EduRisk platform.

## 1. Architecture & Tech Stack
**Q: Why did you choose React and FastAPI instead of a traditional full-stack framework like Django or Laravel?**
> **A**: We wanted a decoupled, API-first architecture. FastAPI is extremely fast due to Starlette and ASGI, and its automatic Swagger documentation is invaluable. React (via Next.js) allows for a highly responsive, component-based UI. Separating them allows the frontend to scale independently from the ML-heavy backend.

**Q: Why MySQL instead of a NoSQL database like MongoDB?**
> **A**: Educational data (Students, Departments, Attendance, Grades) is inherently relational. MySQL enforces ACID compliance, data integrity via foreign keys, and prevents orphaned records (e.g., an intervention for a student that no longer exists). 

## 2. Artificial Intelligence / Machine Learning
**Q: Why did you choose Random Forest for risk prediction? Why not a Neural Network?**
> **A**: Random Forest is an ensemble method that performs exceptionally well on tabular data without requiring massive datasets or extensive hyperparameter tuning. More importantly, it offers high **explainability**. Neural Networks act as a "black box," making it hard to tell a student *why* they are at risk.

**Q: How do you prevent overfitting in your model?**
> **A**: We prevent overfitting through a few techniques:
> 1. Cross-validation during the training phase.
> 2. Limiting the `max_depth` of the trees in the Random Forest.
> 3. Setting a minimum number of `min_samples_split`.

**Q: What is Feature Engineering, and how did you use it?**
> **A**: Feature engineering is transforming raw data into meaningful inputs for the ML model. For example, instead of feeding raw login timestamps, we engineered a feature called `lms_login_frequency` (logins per week), which is much more strongly correlated with dropout risk.

## 3. Backend & Security
**Q: How is authentication handled securely?**
> **A**: We use JSON Web Tokens (JWT). When a user logs in, the server hashes the password using `bcrypt` and verifies it. It then issues a short-lived access token and a long-lived refresh token. The backend does not store session states, ensuring RESTful statelessness.

**Q: How did you implement real-time notifications?**
> **A**: We utilized FastAPI WebSockets. We created a `ConnectionManager` that maintains active WebSocket connections in memory. When the AI detects a critical risk, the server pushes a JSON payload through the socket, updating the React UI instantly without requiring the client to constantly poll the server.

## 4. DevOps & Deployment
**Q: What is the purpose of Docker in this project?**
> **A**: Docker containerizes the application, ensuring that it runs exactly the same way on a developer's laptop as it does on the production server. It eliminates the "it works on my machine" problem.

**Q: Can you explain your CI/CD pipeline?**
> **A**: We use GitHub Actions. Every time code is pushed to the `main` branch, the pipeline spins up an Ubuntu runner. It runs `flake8` to lint the Python code, executes our `pytest` suite, builds the Next.js bundle, and creates Docker images. If any step fails, the deployment is blocked.

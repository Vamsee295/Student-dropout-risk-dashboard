# Contributing to EduRisk

First off, thank you for considering contributing to the EduRisk platform! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) first. If it doesn't exist, feel free to open a new one!

## 2. Fork & Create a Branch

1. Fork the repository.
2. Clone locally: `git clone https://github.com/yourusername/Student-Dropout-Risk-Dashboard.git`.
3. Create your feature branch: `git checkout -b feature/AmazingFeature`.

## 3. Development Setup

### Backend (Python/FastAPI)
1. `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install requirements: `pip install -r requirements.txt`
5. Run tests before committing: `pytest tests/`

### Frontend (React/Next.js)
1. `cd frontend`
2. Install dependencies: `npm install`
3. Run linting: `npm run lint`

## 4. Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations, and container parameters.
3. You may merge the Pull Request in once you have the sign-off of at least one other developer, or if you do not have permission to do that, you may request the reviewer to merge it for you.

## 5. Code Style

- **Python**: We adhere to PEP8 guidelines and use `flake8` for linting.
- **TypeScript/React**: We use ESLint and Prettier. Run `npm run lint` before committing.

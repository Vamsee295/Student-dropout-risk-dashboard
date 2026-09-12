# Demo Credentials Setup Guide

## Quick Start (Before Deployment)

Use these basic credentials for testing and demos:

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | `student@gmail.com` | `Password` |
| **Faculty** | `faculty@gmail.com` | `Password` |
| **Dean** | `dean@gmail.com` | `Password` |

### Alternative Credentials (Backward Compatibility)

| Role | Email | Password |
|------|-------|----------|
| **Student** | `student1@gmail.com` | `Password` |
| **Faculty** | `faculty1@gmail.com` | `Password` |
| **Dean** | `dean1@gmail.com` | `Password` |

---

## Setup Instructions

### 1. Backend Setup

#### Start PostgreSQL
```bash
# Windows (using docker-compose)
docker-compose up -d postgres

# Or start PostgreSQL service locally
```

#### Initialize Database & Seed Demo Users
```bash
cd backend

# Activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Initialize database
python scripts/init_db.py

# Seed demo users
python scripts/seed_demo_users.py

# Start backend server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local (optional - defaults to localhost:8000)
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

---

## Testing the Login

1. Go to `http://localhost:3000`
2. Click on any portal (Student, Faculty, or Dean)
3. Use the credentials above
4. You should see the corresponding dashboard

---

## Docker Setup (Production-like)

```bash
# From project root
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Troubleshooting

### "Not Found" Error on Login

**Possible Causes:**
1. Backend is not running
   - Check: `http://localhost:8000/health`
   - If returns 404, start backend server

2. Database not initialized
   - Run: `python scripts/init_db.py`
   - Then: `python scripts/seed_demo_users.py`

3. Frontend not pointing to correct API
   - Check `frontend/src/lib/api.ts` for API_BASE_URL
   - Should be: `http://localhost:8000/api/v1`

### "Incorrect username or password"

1. Make sure you're using exact credentials from above
2. Password is case-sensitive: `Password` (capital P)
3. Email must be lowercase
4. Clear browser cache and localStorage

### Users Already Exist Error

The seed script skips existing users. To reset:

```bash
# Drop and recreate database
python scripts/init_db.py  # This will drop/create tables

# Then seed again
python scripts/seed_demo_users.py
```

---

## ⚠️ IMPORTANT: Before Production Deployment

**DO NOT deploy with these simple credentials!**

Change credentials before deployment:
1. Generate secure random passwords
2. Update database with `python scripts/create_user.py`
3. Use environment variables for all sensitive data
4. Enable password reset flows
5. Implement 2FA if required

### Generate New Users for Production

```bash
python scripts/create_user.py \
  student@university.edu SecurePassword123 STUDENT \
  --name "John Student"
```

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_dropout_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with email/password
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh access token

### Auto-Provisioning
The system auto-creates users on first login if email contains:
- `student` → STUDENT role
- `faculty` → FACULTY role
- `dean` → DEAN role

Example: Any email like `newstudent123@gmail.com` will auto-create a STUDENT user.

---

## Dashboard Routes

After login, you'll be redirected to:
- **Student**: `/student/dashboard`
- **Faculty**: `/faculty/dashboard`
- **Dean**: `/dean/dashboard`

---

## Support

For issues:
1. Check logs: `docker-compose logs backend`
2. Check API docs: http://localhost:8000/docs
3. Check network tab in browser DevTools
4. Verify .env files and API endpoint configuration

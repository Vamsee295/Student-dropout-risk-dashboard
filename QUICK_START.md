# 🚀 Quick Start - Demo Login Setup

## TL;DR - 30 Second Setup

### Login Credentials (Until Deployment)
```
🎓 STUDENT:  student@gmail.com    | Password: Password
👨‍🏫 FACULTY:  faculty@gmail.com    | Password: Password
👑 DEAN:     dean@gmail.com       | Password: Password
```

---

## ⚡ Quick Setup (5 Minutes)

### 1️⃣ Start Backend

```bash
cd backend

# Windows/Mac/Linux - Install & Run
python -m venv venv
.\venv\Scripts\activate              # Windows
source venv/bin/activate             # Mac/Linux

pip install -r requirements.txt

# Initialize database and create demo users
python scripts/init_db.py
python scripts/seed_demo_users.py

# Start server (Port 8000)
uvicorn app.main:app --reload --port 8000
```

✅ Backend ready: http://localhost:8000
📖 API Docs: http://localhost:8000/docs

### 2️⃣ Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (Port 3000)
npm run dev
```

✅ Frontend ready: http://localhost:3000

### 3️⃣ Login

1. Go to http://localhost:3000
2. Select your role (Student/Faculty/Dean)
3. Use credentials above (auto-populated)
4. Click "Sign In"

---

## 🔧 Using Docker (Easier)

```bash
# From project root
docker-compose up --build

# Services start automatically:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Database: PostgreSQL on port 5432
```

---

## ❌ Troubleshooting

### "Not Found" Error on Login

**Check Backend is Running:**
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

If not, restart backend:
```bash
# In backend directory:
uvicorn app.main:app --reload --port 8000
```

### "Incorrect username or password"

1. ✅ Ensure exact credentials (case-sensitive):
   - Email: lowercase `student@gmail.com`
   - Password: capital P `Password`

2. ✅ Check database initialized:
   ```bash
   python scripts/init_db.py
   python scripts/seed_demo_users.py
   ```

3. ✅ Clear browser cache: `Ctrl+Shift+Delete`

### API Endpoints Return 404

- Make sure backend is running on port 8000
- Check API URL: Should be `http://localhost:8000/api/v1`
- Check network tab in DevTools to see actual requests

### Port Already in Use

```bash
# Change port (e.g., 8001)
uvicorn app.main:app --reload --port 8001

# Update frontend .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
```

---

## 📋 What Changed

✅ **Password validation relaxed** - Now accepts simple passwords like "Password"
✅ **Demo users script created** - `seed_demo_users.py` creates all 6 test accounts
✅ **Login page updated** - Shows correct credentials and accepts "Password"
✅ **Auto-provisioning enabled** - Users auto-create on first login with demo emails

---

## 🔐 BEFORE DEPLOYMENT

**⚠️ DO NOT deploy with these simple credentials!**

1. Change all passwords to secure random ones
2. Update `.env` with production database URL
3. Set `SECRET_KEY` to random value
4. Disable auto-provisioning (optional)
5. Enable 2FA/MFA
6. Use HTTPS

### Generate Secure User for Production
```bash
python scripts/create_user.py \
  user@university.edu "SecurePassword123!" FACULTY \
  --name "John Doe"
```

---

## 📞 Common Issues Checklist

- [ ] Backend running on port 8000?
- [ ] Frontend running on port 3000?
- [ ] Database initialized? (`init_db.py` ran)
- [ ] Demo users created? (`seed_demo_users.py` ran)
- [ ] Correct email/password (case-sensitive)?
- [ ] Browser cache cleared?
- [ ] No other services on ports 3000/8000/5432?

---

## 📚 Additional Resources

- Backend README: `backend/README.md`
- API Documentation: `backend/docs/API_REFERENCE.md`
- Database Schema: `backend/docs/DATABASE.md`
- Full Setup Guide: `SETUP_GUIDE.md`
- Demo Credentials Detailed: `DEMO_CREDENTIALS.md`

---

## 🎯 What to Test

After login, verify these work:

### Student Dashboard
- [ ] View dropout risk score
- [ ] Check attendance
- [ ] See assignments
- [ ] View risk factors (SHAP)

### Faculty Dashboard
- [ ] See student list
- [ ] View at-risk students
- [ ] Check department analytics
- [ ] Attendance trend chart

### Dean Dashboard
- [ ] View institutional KPIs
- [ ] See department breakdown
- [ ] Check alerts
- [ ] View risk trends

---

**Questions? Check the detailed `DEMO_CREDENTIALS.md` file for more info!**

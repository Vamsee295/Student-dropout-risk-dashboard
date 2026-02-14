# 📝 Quick Start Commands

Quick reference for running the Student Dropout Risk Dashboard after initial setup.

---

## ⚡ Quick Start (After First Setup)

### 1️⃣ Start Backend Server

```bash
cd backend
.\venv\Scripts\activate              # Windows
source venv/bin/activate             # Mac/Linux
uvicorn app.main:app --reload --port 8000
```

✅ Backend runs on: http://localhost:8000

---

### 2️⃣ Start Frontend Server (New Terminal)

```bash
cd frontend
npm run dev
```

✅ Frontend runs on: http://localhost:3000

---

## 🔗 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | Main application |
| **API Health** | http://localhost:8000/health | Backend health check |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Students API** | http://localhost:8000/api/students/all | Get all students |
| **Analytics API** | http://localhost:8000/api/analytics/overview | Dashboard analytics |

---

## 🛑 Stop Servers

- Press `Ctrl+C` in each terminal window
- Backend: Run `deactivate` to exit virtual environment

---

## 🔄 First Time Setup?

See [SETUP.md](./SETUP.md) for complete installation instructions.

---

## 🐛 Quick Troubleshooting

### Backend not starting?
```bash
# Check if virtual environment is activated (you should see (venv))
# If not:
cd backend
.\venv\Scripts\activate    # Windows
source venv/bin/activate   # Mac/Linux
```

### Frontend shows "Failed to fetch"?
```bash
# Make sure backend is running!
# Test: http://localhost:8000/health
```

### Port already in use?
```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux - Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

---

## 📦 Update Dependencies

### Backend
```bash
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

---

## 💾 Database Commands

### Access MySQL Database
```bash
mysql -u root -p
use student_dropout_db;
```

### Refresh Sample Data
```bash
cd backend
.\venv\Scripts\activate
python scripts/generate_risk_scores.py
```

---

**Need detailed setup instructions?** → See [SETUP.md](./SETUP.md)

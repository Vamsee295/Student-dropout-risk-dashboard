# 🚀 Student Dropout Risk Dashboard - Setup Guide

Complete setup instructions for cloning and running the project with real-time data.

---

## 📋 Prerequisites

Before you start, make sure you have these installed:

### Required Software
1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Python** (v3.9 - 3.13) - [Download here](https://www.python.org/downloads/)
3. **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/installer/)
4. **Git** - [Download here](https://git-scm.com/downloads)

### Verify Installations
Open a terminal and run:
```bash
node --version    # Should show v18 or higher
python --version  # Should show 3.9 or higher
mysql --version   # Should show 8.0 or higher
git --version     # Should show any recent version
```

---

## 📥 Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/YOUR_USERNAME/Student-dropout-risk-dashboard.git

# Navigate to project directory
cd Student-dropout-risk-dashboard
```

---

## 🗄️ Step 2: Database Setup

### A. Start MySQL Server
- **Windows**: Open MySQL Workbench or start MySQL service from Services
- **Mac/Linux**: Run `sudo service mysql start`

### B. Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE student_dropout_db;
```

### C. Verify Database Creation
```sql
SHOW DATABASES;
```
You should see `student_dropout_db` in the list.

---

## 🔧 Step 3: Backend Setup

### A. Navigate to Backend Directory
```bash
cd backend
```

### B. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
```

**Mac/Linux:**
```bash
python3 -m venv venv
```

### C. Activate Virtual Environment

**Windows:**
```bash
.\venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal prompt.

### D. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- FastAPI, Uvicorn (web framework)
- SQLAlchemy, PyMySQL (database)
- Pandas, NumPy (data processing)
- Scikit-learn, XGBoost, SHAP (machine learning)
- And more...

⏱️ **Note**: This may take 5-10 minutes depending on your internet speed.

### E. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env    # Windows
   cp .env.example .env      # Mac/Linux
   ```

2. Open `.env` file and update the database URL:
   ```
   DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/student_dropout_db
   ```
   Replace `YOUR_PASSWORD` with your MySQL root password.

### F. Initialize Database

```bash
python scripts/init_db.py
```

This creates all necessary database tables.

### G. Load Sample Data

```bash
python scripts/generate_risk_scores.py
```

This generates sample student data with risk scores for testing.

### H. Start Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

✅ **Backend is now running on http://localhost:8000**

---

## 🎨 Step 4: Frontend Setup

### A. Open New Terminal Window

**Important**: Keep the backend terminal running! Open a NEW terminal window.

### B. Navigate to Frontend Directory

```bash
cd Student-dropout-risk-dashboard/frontend
```

### C. Install Node Dependencies

```bash
npm install
```

This installs:
- Next.js (React framework)
- Tailwind CSS (styling)
- Recharts (charts)
- Lucide React (icons)
- And more...

⏱️ **Note**: This may take 3-5 minutes.

### D. Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

✅ **Frontend is now running on http://localhost:3000**

---

## ✅ Step 5: Verify Everything Works

### A. Check Backend Health

Open browser and visit: http://localhost:8000/health

You should see:
```json
{
  "status": "healthy",
  "database": "healthy",
  "model_loaded": true
}
```

### B. Check Backend API Documentation

Visit: http://localhost:8000/docs

You'll see interactive API documentation with all available endpoints.

### C. Check Frontend Dashboard

Visit: http://localhost:3000

You should see:
1. ✅ Dashboard metrics loading (Total Students, High Risk Count, etc.)
2. ✅ Risk distribution chart rendering
3. ✅ Recent critical alerts showing student data
4. ✅ No "Failed to fetch" errors in browser console

### D. Open Browser Console

Press `F12` (Windows) or `Cmd+Option+I` (Mac) to open Developer Tools.

Check the Console tab - there should be **NO red errors**.

---

## 🔄 Step 6: Working with Real-Time Data

The system automatically updates when you:

### Update Student Metrics
Use the API documentation at http://localhost:8000/docs

### Test Real-Time Updates

1. Open dashboard at http://localhost:3000
2. Go to http://localhost:8000/docs
3. Find the `POST /api/students/{id}/metrics` endpoint
4. Update a student's metrics
5. Refresh the dashboard - you'll see updated data!

---

## 🛑 Stopping the Servers

### Stop Frontend
1. Go to the frontend terminal
2. Press `Ctrl+C` (Windows/Mac/Linux)

### Stop Backend
1. Go to the backend terminal
2. Press `Ctrl+C` (Windows/Mac/Linux)
3. Deactivate virtual environment:
   ```bash
   deactivate
   ```

---

## 🔄 Starting Again (After First Setup)

Once you've completed the setup once, use these quick commands:

### Start Backend
```bash
cd backend
.\venv\Scripts\activate              # Windows
source venv/bin/activate             # Mac/Linux
uvicorn app.main:app --reload --port 8000
```

### Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "uvicorn: command not found"

**Solution**: Virtual environment not activated
```bash
cd backend
.\venv\Scripts\activate              # Windows
source venv/bin/activate             # Mac/Linux
```

### Issue 2: "Module 'app.main' not found" 

**Solution**: Wrong directory
```bash
# Make sure you're in the backend directory
cd backend
```

### Issue 3: Database connection error

**Solution**: Check MySQL is running and credentials in `.env` are correct
```bash
# Verify MySQL is running
mysql -u root -p
```

### Issue 4: Port 8000 already in use

**Solution**: Kill existing process
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### Issue 5: Frontend shows "Failed to fetch"

**Solution**: Backend is not running
1. Check backend terminal is running
2. Visit http://localhost:8000/health
3. If error, restart backend server

### Issue 6: "npm install" fails

**Solution**: Clear npm cache
```bash
npm cache clean --force
npm install
```

---

## 📁 Project Structure Overview

```
Student-dropout-risk-dashboard/
├── backend/
│   ├── app/                    # Application code
│   │   ├── routes/            # API endpoints
│   │   ├── models.py          # Database models
│   │   └── main.py            # FastAPI app
│   ├── scripts/               # Utility scripts
│   ├── venv/                  # Python virtual environment
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
└── frontend/
    ├── src/
    │   ├── app/               # Next.js pages
    │   └── components/        # React components
    ├── package.json           # Node dependencies
    └── node_modules/          # Installed packages
```

---

## 🔑 Important Files to Configure

1. **backend/.env** - Database credentials and API configuration
2. **backend/requirements.txt** - Python dependencies
3. **frontend/package.json** - Node.js dependencies

---

## 📚 Additional Resources

- **Backend API Docs**: http://localhost:8000/docs (when server is running)
- **Frontend Dev Server**: http://localhost:3000 (when server is running)
- **Project Documentation**: See README.md

---

## ✅ Checklist for Your Teammate

- [ ] Install Node.js (v18+)
- [ ] Install Python (3.9-3.13)
- [ ] Install MySQL (8.0+)
- [ ] Clone repository
- [ ] Create MySQL database
- [ ] Setup backend virtual environment
- [ ] Install backend dependencies
- [ ] Configure .env file
- [ ] Initialize database
- [ ] Generate sample data
- [ ] Start backend server
- [ ] Install frontend dependencies
- [ ] Start frontend server
- [ ] Verify dashboard loads successfully

---

## 💡 Pro Tips

1. **Always activate virtual environment** before working on backend
2. **Keep both servers running** in separate terminal windows
3. **Check backend health** at http://localhost:8000/health before debugging frontend
4. **Use API docs** at http://localhost:8000/docs for testing endpoints
5. **Check browser console** (F12) for frontend errors

---

## 🆘 Need Help?

If you encounter issues not covered here:
1. Check the error message carefully
2. Verify all prerequisites are installed
3. Make sure MySQL is running
4. Check both terminals for error messages
5. Restart both servers

---

**Happy coding! 🎉**

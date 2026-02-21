# AI Financial Tracker - Setup Guide

A full-stack financial tracking application with AI-powered insights and smart shopping recommendations.

## Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL 12+** (for database)
- **Git**

## Project Structure

```
ai-financial-tracker-backend2/
├── main.py                          # FastAPI backend server
├── auth.py                          # Authentication logic
├── db.py                            # Database configuration
├── models.py                        # SQLAlchemy models
├── requirements.txt                 # Python dependencies
├── .env                             # Environment variables (create from template)
└── finance_tracker_frontend/        # React + TypeScript frontend
    ├── package.json
    ├── vite.config.ts
    └── src/
```

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-financial-tracker-backend2.git
cd ai-financial-tracker-backend2
```

### 2. Create and Activate Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables

Create a `.env` file in the `ai-financial-tracker-backend2` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/financial_tracker_db

# APIs
SERP_API_KEY=your_serp_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# JWT
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Get API Keys:**
- **SERP_API_KEY**: Sign up at [SerpAPI](https://serpapi.com)
- **OPENAI_API_KEY**: Get from [OpenAI](https://platform.openai.com/api-keys)
- **SECRET_KEY**: Generate using `openssl rand -hex 32` or any secure random string

### 5. Setup PostgreSQL Database

```bash
# Create database
createdb financial_tracker_db

# Run migrations (if exists) or create tables
python -c "from db import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

### 6. Run Backend Server

```bash
fastapi run main.py
```

Server will be available at `http://localhost:8000`

API docs available at `http://localhost:8000/docs`

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd finance_tracker_frontend
```

### 2. Setup Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Running the Full Application

### Terminal 1: Backend

```bash
cd ai-financial-tracker-backend2
venv\Scripts\activate  # or source venv/bin/activate on macOS/Linux
fastapi run main.py
```

### Terminal 2: Frontend

```bash
cd ai-financial-tracker-backend2/finance_tracker_frontend
npm run dev
```

Then open http://localhost:5173 in your browser

## Available Scripts

### Backend
- `fastapi run main.py` - Run development server
- `fastapi run main.py --reload` - Run with auto-reload on changes

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Database Reset

To reset the database:

```bash
python -c "from db import engine; from models import Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
```

## Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env` file
- Verify database exists: `psql -l`

### API Key Errors
- Verify all API keys are correctly set in `.env`
- Check API key validity on their respective platforms

### Port Already in Use
- Backend (8000): `lsof -i :8000` then `kill -9 <PID>`
- Frontend (5173): Change in `vite.config.ts`

### Module Not Found
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

## Features

✅ User Authentication (JWT)  
✅ Expense Tracking  
✅ Savings Goals Management  
✅ AI-powered Financial Insights  
✅ Smart Shopping Recommendations  
✅ Voice-to-Text for Quick Logging  
✅ Real-time Chat with Finance Assistant  

## Tech Stack

**Backend:**
- FastAPI
- SQLAlchemy
- PostgreSQL
- OpenAI GPT API
- SerpAPI

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy Financial Tracking! 📊💰**

from fastapi import FastAPI,Depends,HTTPException
from pydantic import BaseModel, ConfigDict
from db import sessionLocal,engine
from typing import Annotated,List
import models
from sqlalchemy.orm import Session 
from models import Profile,Expense,SavingsGoal,Users,ChatMessage
import auth
from auth import get_current_user
from starlette import status
from sqlalchemy import func, extract
from datetime import datetime
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware



app=FastAPI()

# Allow frontend dev server / deployments to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
models.Base.metadata.create_all(bind=engine)
from fastapi import APIRouter


router = APIRouter()

@router.post("/chatbot/{user_id}")
def chat(user_id:int, message:str):
    reply = chatbot(user_id, message)
    return {"reply": reply}





class profilecreate(BaseModel):
    name:str
    monthlyincome:int
    goal:int | None=None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    monthlyincome: Optional[int] = None
    goal: Optional[int] = None
class profileresponse(BaseModel):
    id:str
    name:str
    monthlyincome:int
    goal:int | None=None
    createdAt:str
    user_id:int
    model_config = ConfigDict(from_attributes=True)


def get_db():
    db=sessionLocal()
    try:
       yield db
    finally:
       db.close()


db_dependency=Annotated[Session,Depends(get_db)]
user_dependency=Annotated[dict,Depends(get_current_user)]

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    
    # This field captures the "UPI" or "Cash" value from your dropdown
    payment_method: str = "UPI"

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None

class ExpenseResponse(ExpenseCreate):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class DailyExpenseSummary(BaseModel):
    total_amount: float
    transaction_count: int

# --- SAVINGS SCHEMAS ---
class SavingsDashboard(BaseModel):
    monthly_goal: float
    available_income: float
    variable_spending: float
    net_savings: float
    savings_progress_percent: float

class SavingsGoalUpdate(BaseModel):
    monthly_target: Optional[float] = None

class SavingsGoalResponse(BaseModel):
    id: int
    user_id: int
    monthly_target: float
    
    class Config:
        from_attributes = True




@app.post("/expense")
async def setExpense(expense:ExpenseCreate,db:db_dependency,user:user_dependency) ->ExpenseResponse:
       if user is None:
           raise HTTPException(status_code=401,detail='Authentication Failed')
       db_expense=models.Expense(**expense.model_dump(),user_id=user['id'])
       db.add(db_expense)
       db.commit()
       db.refresh(db_expense)
       return db_expense








@app.post("/profile")
async def create_profile(
    profile:profilecreate,
    db:db_dependency,
    user:user_dependency
    ):
      if user is None:
          raise HTTPException(status_code=401,detail='Authentication Failed')
      db_profile=Profile(**profile.model_dump(),user_id=user['id'])
      db.add(db_profile)
      db.commit()
      db.refresh(db_profile)

      return db_profile

@app.get("/profile")
async def profile(db:db_dependency,
                  user:user_dependency):
    if user is None:
          raise HTTPException(status_code=401,detail='Authentication Failed')
    res=db.query(Profile).filter(Profile.user_id==user['id']).all()
    return res


@app.patch("/profile", response_model=profileresponse)
async def update_profile(
    profile_update: ProfileUpdate,
    db: db_dependency,
    user: user_dependency
):
    """Update the authenticated user's profile"""
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    db_profile = db.query(Profile).filter(Profile.user_id == user['id']).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    # Update only provided fields
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile



@app.get("/",status_code=status.HTTP_200_OK)
async def user(user:user_dependency,db:db_dependency):
    if user is None:
        raise HTTPException(status_code=401,detail='Authentication Failed')
    return {"User":user}


@app.post("/expenses/", response_model=ExpenseResponse)
def create_expense(user:user_dependency,expense: ExpenseCreate, db: Session = Depends(get_db)):
    # Assuming User ID 1 is logged in
    current_user_id = user['id']
    
    # This automatically includes payment_method from the schema
    new_expense = Expense(
        **expense.dict(), 
        user_id=current_user_id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@app.get("/expenses/", response_model=List[ExpenseResponse])
def list_expenses(user: user_dependency, db: Session = Depends(get_db)):
    """List all expenses for the authenticated user (newest first)."""
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")
    current_user_id = user["id"]
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user_id)
        .order_by(Expense.created_at.desc())
        .all()
    )
    return expenses

@app.get("/expenses/today", response_model=DailyExpenseSummary)
def get_today_summary(user:user_dependency,db: Session = Depends(get_db)):
    current_user_id = user['id']
    today = datetime.now().date()
    
    query = db.query(Expense).filter(
        Expense.user_id == current_user_id,
        func.date(Expense.created_at) == today
    )
    
    total = query.with_entities(func.sum(Expense.amount)).scalar() or 0.0
    count = query.count()
    
    return {"total_amount": total, "transaction_count": count}

@app.patch("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    db: db_dependency,
    user: user_dependency
):
    """Update a specific expense"""
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    db_expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user['id']
    ).first()
    
    if not db_expense:
        raise HTTPException(status_code=404, detail='Expense not found')
    
    # Validate amount if provided
    if expense_update.amount is not None and expense_update.amount <= 0:
        raise HTTPException(status_code=400, detail='Amount must be greater than 0')
    
    # Update only provided fields
    update_data = expense_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: int,
    db: db_dependency,
    user: user_dependency
):
    """Delete a specific expense"""
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    db_expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user['id']
    ).first()
    
    if not db_expense:
        raise HTTPException(status_code=404, detail='Expense not found')
    
    db.delete(db_expense)
    db.commit()
    return None

@app.get("/savings/dashboard", response_model=SavingsDashboard)
def get_savings_dashboard(user:user_dependency,db: Session = Depends(get_db)):
    current_user_id = user['id']
    current_month = datetime.now().month
    
    # 1. Get Goal
    goal = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user_id).first()
    if not goal:
        goal = SavingsGoal(user_id=current_user_id, monthly_target=15000.0)
        db.add(goal)
        db.commit()

    # 2. Mock Profile Data (Replace with real queries to your team's User table)
    monthly_income = 50000.0
    fixed_expenses = 30000.0
    available_income = monthly_income - fixed_expenses

    # 3. Calculate Variable Spending
    variable_spending = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user_id,
        extract('month', Expense.created_at) == current_month
    ).scalar() or 0.0

    # 4. Net Savings & Progress
    net_savings = available_income - variable_spending
    progress = (net_savings / goal.monthly_target * 100) if goal.monthly_target > 0 else 0

    return {
        "monthly_goal": goal.monthly_target,
        "available_income": available_income,
        "variable_spending": variable_spending,
        "net_savings": net_savings,
        "savings_progress_percent": round(progress, 1)
    }

@app.patch("/savings-goal", response_model=SavingsGoalResponse)
async def update_savings_goal(
    goal_update: SavingsGoalUpdate,
    db: db_dependency,
    user: user_dependency
):
    """Update the authenticated user's savings goal"""
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    db_goal = db.query(SavingsGoal).filter(SavingsGoal.user_id == user['id']).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail='Savings goal not found')
    
    if goal_update.monthly_target is not None and goal_update.monthly_target <= 0:
        raise HTTPException(status_code=400, detail='Monthly target must be greater than 0')
    
    # Update only provided fields
    update_data = goal_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_goal, field, value)
    
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.delete("/savings-goal", status_code=status.HTTP_204_NO_CONTENT)
async def delete_savings_goal(db: db_dependency, user: user_dependency):
    """Delete the authenticated user's savings goal"""
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    db_goal = db.query(SavingsGoal).filter(SavingsGoal.user_id == user['id']).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail='Savings goal not found')
    
    db.delete(db_goal)
    db.commit()
    return None

from openai import OpenAI
OLLAMA_BASE_URL = "http://localhost:11434/v1"
client= OpenAI(base_url=OLLAMA_BASE_URL, api_key="anything")

class ChatRequest(BaseModel):
    message: str

def get_user_data(db: Session, user_id: int):
    user = db.query(Users).filter(Users.id == user_id).first()
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    goal = db.query(SavingsGoal).filter(SavingsGoal.user_id == user_id).first()

    return user, profile, expenses, goal
def analyse_behavior(expenses):
    
    category_spending = {}
    total_spent = 0.0

    expense_summary = []

    for e in expenses:
        # summary for AI
        expense_summary.append({
            "amount": e.amount,
            "category": e.category
        })

        # calculations
        total_spent += e.amount
        if e.category in category_spending:
            category_spending[e.category] += e.amount
        else:
            category_spending[e.category] = e.amount

    highest_category = (
        max(category_spending, key=category_spending.get)
        if category_spending else None
    )

    return {
        "total_spent": total_spent,
        "category_spending": category_spending,
        "highest_category": highest_category,
        "expense_summary": expense_summary
    }

MAX_HISTORY = 10

def save_message(db: Session, user_id: int, role: str, content: str):
    msg = ChatMessage(
        user_id=user_id,
        role=role,
        content=content
    )
    db.add(msg)
    db.commit()

def get_chat_history(db: Session, user_id: int, limit: int = MAX_HISTORY):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {"role": m.role, "content": m.content}
        for m in reversed(messages)
    ]



@app.post("/chat")
async def chat_with_ai(
    request: ChatRequest, 
    db: db_dependency, 
    user: user_dependency
):
    current_user = user  # auth dict
    user_id = current_user["id"]
    user, profile, expenses, goal = get_user_data(db, user_id)
    # 1. Check if user is logged in
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    try:
        # 2. Call your AI logic (Adapting from your ai_service.py)
        # For now, let's use the simple chat completion logic
        
        import os
        behave=analyse_behavior(expenses)
        SYSTEM_PROMPT = """
            You are an AI Money Coach.
            You remember previous messages.
            Give short, practical financial advice.

            You will be given:
            - User profile
            - Expense summary
            - Spending analysis

            Rules:
            - NEVER invent numbers
            - Use given data only
            - Respond in simple English
            - If user asks for advice, explain WHY

            If the user is overspending, warn politely.
            """
        
        history = get_chat_history(db, user_id)
        save_message(db, user_id, "user", request.message)
        
        response = client.responses.create(
        model="llama3.2",
        input = [
    {
        "role": "system",
        "content": f"""
        You are an AI Money Coach.

        USER PROFILE
        - Name: {profile.name if profile else "Unknown"}
        - Monthly Income: {profile.monthlyincome if profile else "Not set"}
        - Savings Goal: {goal.monthly_target if goal else "Not set"}

        SPENDING ANALYSIS
        - Total Spent: {behave["total_spent"]}
        - Category Spending: {behave["category_spending"]}
        - Highest Spending Category: {behave["highest_category"]}

        RULES
        - Use ONLY the data above
        - NEVER invent numbers
        - Be concise and practical
        - Explain WHY when giving advice
        """
            },

            # 🔹 Conversation memory (from DB)
            *history,

            # 🔹 Current user message (ONLY what user typed)
            {
                "role": "user",
                "content": request.message
            }
        ]

        ) 
        save_message(db, user_id, "system", response.output_text)

        return {"reply": response.output_text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")
    
    import whisper
import os
from fastapi import UploadFile, File
import whisper
import subprocess
from pathlib import Path

# Set up FFmpeg path if it's in the standard location
ffmpeg_path = Path(os.path.expanduser("~")) / "AppData" / "Local" / "ffmpegio" / "ffmpeg-downloader" / "ffmpeg" / "bin" / "ffmpeg.exe"
if ffmpeg_path.exists():
    os.environ["PATH"] = str(ffmpeg_path.parent) + os.pathsep + os.environ.get("PATH", "")

# Load the model once when the server starts (Base is fast and accurate)
model = whisper.load_model("base")

@app.post("/voice-to-text")
async def transcribe_voice(file: UploadFile = File(...)):
    # 1. Save the uploaded audio temporarily
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        buffer.write(await file.read())

    # 2. Transcribe using Whisper
    try:
        result = model.transcribe(temp_file)
        os.remove(temp_file) # Clean up
        return {"text": result["text"]}
    except FileNotFoundError as e:
        os.remove(temp_file) if os.path.exists(temp_file) else None
        raise HTTPException(
            status_code=500, 
            detail="FFmpeg is required for audio processing. Please ensure FFmpeg is installed."
        )

import requests

def ask_llama(prompt: str):
    # If using Ollama (Local Llama)
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(url, json=payload)
    return response.json().get("response")

@app.get("/ai/smart-tips")
def get_llama_tips(
    db: db_dependency,
    current_user: user_dependency
):
    # 1. Fetch user spending data to give to Llama
    expenses = db.query(Expense).filter(Expense.user_id == current_user["id"]).all()
    expense_summary = ", ".join([f"{e.category}: {e.amount}" for e in expenses])

    # 2. Get user profile for monthly income
    profile = db.query(Profile).filter(Profile.user_id == current_user["id"]).first()
    monthly_income = profile.monthlyincome if profile else 0

    # 3. Create a specific prompt for the chatbot
    prompt = f"""
    The user has a monthly income of {monthly_income}.
    Their recent expenses are: {expense_summary}.
    As a financial expert AI, give 3 short, actionable "Smart Tips" to save money this month.
    Keep it under 50 words.
    """

    ai_response = ask_llama(prompt)
    return {"tips": ai_response}

import os
from serpapi import Client

SERP_API_KEY = os.getenv("SERP_API_KEY")

def fetch_shopping_data(product_name: str):
    params = {
        "engine": "google_shopping",
        "q": product_name,
        "gl": "in",            # India
        "hl": "en",
        "location": "India",
    }

    client = Client(api_key=SERP_API_KEY)
    results = client.search(params)

    shopping_results = results.get("shopping_results", [])

    products = []
    for item in shopping_results[:5]:
        products.append({
            "title": item.get("title", "Unknown"),
            "price": item.get("price", "Not listed"),
            "source": item.get("source", "Online Store"),
            "rating": item.get("rating") if item.get("rating") else "No rating data",
            "reviews": item.get("reviews") if item.get("reviews") else "No review data"
        })

    return products
class AnalyzePurchaseRequest(BaseModel):
    item_name: str
    offline_price: float

@app.post("/ai/analyze-purchase")
async def analyze_with_llama(
    data: AnalyzePurchaseRequest,
    db: db_dependency,
    current_user: user_dependency
):
    # Get user profile for monthly income and savings goal
    profile = db.query(Profile).filter(Profile.user_id == current_user["id"]).first()
    goal = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user["id"]).first()
    
    monthly_income = profile.monthlyincome if profile else 0
    monthly_target = goal.monthly_target if goal else 0
    online_products=fetch_shopping_data(data.item_name)
    # Context for the AI
    prompt =  f"""
    You are a smart shopping assistant.
    You are a smart shopping assistant.

    Product: {data.item_name}
    Offline Price: ₹{data.offline_price}

    Online Options:
    {online_products}

    Rules:
    - NEVER mention missing data
    - NEVER say "I don't have enough information"
    - If ratings are unavailable, ignore them
    - Focus on price comparison and value

    


    Product: {data.item_name}
    Offline Price: ₹{data.offline_price}

    Online Options:
    {online_products}

    User Monthly Income: ₹{monthly_income}
    User Monthly Savings Goal: ₹{monthly_target}

    Task:
    - Compare online vs offline prices
    - Consider ratings and reviews
    - Check affordability based on income
    - Recommend: Buy Online / Buy Offline / Wait
    - Explain clearly in 2–3 sentences
    """
    decision = ask_llama(prompt)
    return {
        "product": data.item_name,
        "offline_price": data.offline_price,
        "online_results": online_products,
        "ai_decision": decision
    }


import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends
from tempfile import NamedTemporaryFile

router = APIRouter()

# Load the model once (use 'base' or 'tiny' for speed on a prototype)
model = whisper.load_model("base")

@router.post("/process-voice")
async def process_voice(
    file: UploadFile = File(...), 
    current_user: user = Depends(get_current_user)
):
    # 1. Create a temporary file to store the incoming audio
    with NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        shutil.copyfileobj(file.file, temp_audio)
        temp_path = temp_audio.name

    try:
        # 2. Transcribe the audio to text
        result = model.transcribe(temp_path)
        user_text = result["text"]

        # 3. (Optional) Immediately pass this text to your Llama function
        # response = ask_llama(user_text, current_user)
        
        return {
            "transcription": user_text,
            "status": "success"
        }

    finally:
        # 4. Always clean up the temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
from fastapi import FastAPI,Depends,HTTPException
from pydantic import BaseModel, ConfigDict
from db import sessionLocal,engine
from typing import Annotated,List
import models
from sqlalchemy.orm import Session 
from models import Profile,Expense,SavingsGoal
import auth
from auth import get_current_user
from starlette import status
from sqlalchemy import func, extract
from datetime import datetime
from typing import Optional


app=FastAPI()
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

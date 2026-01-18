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

users={1:
       {
    "name":"dany",
    "passwd":"12345",
    "monthlyincome":"50000",
    "goals":"20000",
    "createdAt":"12.00"
}}




class profilecreate(BaseModel):
    name:str
    monthlyincome:int
    goal:int | None=None


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
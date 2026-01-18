from fastapi import FastAPI,Depends,HTTPException
from pydantic import BaseModel, ConfigDict
from db import sessionLocal,engine
from typing import Annotated,List
import models
from sqlalchemy.orm import Session 
from models import Profile
import auth
from auth import get_current_user
from starlette import status

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




class Expense(BaseModel):
    amount:int
    category:str
    description:str | None =None
    paymentType:str





@app.post("/expense")
async def setExpense(expense:Expense) ->Expense:
       return expense





def get_db():
    db=sessionLocal()
    try:
       yield db
    finally:
       db.close()

Db_dependency=Annotated[Session,Depends(get_db)]
user_dependency=Annotated[dict,Depends(get_current_user)]

@app.post("/profile")
async def create_profile(
    profile:profilecreate,
    db:Db_dependency,
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
async def profile(db:Db_dependency,
                  user:user_dependency):
    if user is None:
          raise HTTPException(status_code=401,detail='Authentication Failed')
    res=db.query(Profile).filter(Profile.user_id==user['id']).all()
    return res

@app.get("/",status_code=status.HTTP_200_OK)
async def user(user:user_dependency,db:Db_dependency):
    if user is None:
        raise HTTPException(status_code=401,detail='Authentication Failed')
    return {"User":user}
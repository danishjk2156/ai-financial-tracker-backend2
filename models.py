from sqlalchemy import Column,Integer,String,Boolean,DateTime,func,ForeignKey,Float
from sqlalchemy.dialects.postgresql import UUID
from db import Base

import uuid

class Profile(Base):
    __tablename__="profile"
    id=Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    name=Column(String,nullable=False)
    monthlyincome=Column(Integer,nullable=False)
    goal=Column(Integer)
    createdAt= Column(DateTime, server_default=func.now(), nullable=False)
    user_id=Column(Integer,ForeignKey('users.id'),nullable=False)

class Users(Base):
    __tablename__='users'

    id=Column(Integer,primary_key=True,index=True)
    username=Column(String,unique=True)
    hashed_password=Column(String)



class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    # 1. Foreign Key (Strict link to your team's Users table)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)   # e.g., "Food", "Transport"
    description = Column(String, nullable=True) # e.g., "Lunch at office"
    
    # 2. Payment Method (Matches your UI Dropdown)
    payment_method = Column(String, default="UPI", nullable=False) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Only Monthly Target (Emergency Fund removed as requested)
    monthly_target = Column(Float, default=15000.0)

from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String(10))  # user / assistant
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

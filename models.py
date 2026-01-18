from sqlalchemy import Column,Integer,String,Boolean,DateTime,func,ForeignKey
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
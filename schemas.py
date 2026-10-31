from pydantic import BaseModel
from datetime import date

class UserCreate(BaseModel):
    email: str
    password: str

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    note: str = ""
    date: date

class ExpenseOut(ExpenseCreate):
    id: int

    class Config:
        from_attributes = True
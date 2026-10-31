from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas
from auth import get_db, hash_password, verify_password, create_token, get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Expense Tracker API is running"}

@app.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(email=user.email, hashed_password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    return {"message": "Account created"}

@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    return {"access_token": create_token(user.email), "token_type": "bearer"}

@app.post("/expenses", response_model=schemas.ExpenseOut)
def add_expense(exp: schemas.ExpenseCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    new_exp = models.Expense(**exp.model_dump(), user_id=user.id)
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp

@app.get("/expenses", response_model=list[schemas.ExpenseOut])
def list_expenses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Expense).filter(models.Expense.user_id == user.id).all()

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    exp = db.query(models.Expense).filter(
        models.Expense.id == expense_id, models.Expense.user_id == user.id
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(exp)
    db.commit()
    return {"message": "Deleted"}
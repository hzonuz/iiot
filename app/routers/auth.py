from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth import create_user, get_db, get_user, create_access_token, pwd_context
from app.schemas import UserCreate as UserSchema


router = APIRouter()

@router.post('/auth/register')
def register(user: UserSchema, db: Session = Depends(get_db)):
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    create_user(db=db, user=user)
    return {"msg": "User registered successfully"}

@router.post('/auth/login')
def login(data: UserSchema, db: Session = Depends(get_db)):
    user = get_user(db, data.username)
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

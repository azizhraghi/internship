from datetime import datetime, timedelta
from typing import Optional, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from shared.config import settings

# In a real app, load this from environment variables
SECRET_KEY = "super-secret-key-for-jwt-signing"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    permissions: list[str] = []

class User(BaseModel):
    username: str
    permissions: list[str] = []

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        permissions: list[str] = payload.get("permissions", [])
        if username is None:
            return None
        return TokenData(username=username, permissions=permissions)
    except JWTError:
        return None

def check_permissions(required_permissions: list[str], token_data: TokenData) -> bool:
    """Check if the user has all required permissions."""
    user_perms = set(token_data.permissions)
    return all(p in user_perms for p in required_permissions)

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> User:
    """FastAPI dependency that extracts and validates the current user from a JWT.
    During development, returns a default dev user if no token is provided."""
    if token is None:
        # Dev fallback — remove in production
        return User(username="dev_user", permissions=["admin"])
    
    token_data = decode_access_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return User(username=token_data.username, permissions=token_data.permissions)


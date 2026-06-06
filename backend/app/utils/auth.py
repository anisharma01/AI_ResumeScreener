import hashlib
import os
import secrets
import jwt
import sqlite3
import datetime
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger("app.utils.auth")

try:
    import psycopg2
except ImportError:
    psycopg2 = None

JWT_SECRET = os.getenv("JWT_SECRET", "rescore_super_secret_key_123456_secure_key")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    if DATABASE_URL and psycopg2:
        return psycopg2.connect(DATABASE_URL)
    return sqlite3.connect("users.db")

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if DATABASE_URL and psycopg2:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL
                )
            """)
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}", exc_info=True)
        raise e

# Hash a password using PBKDF2-HMAC-SHA256
def hash_password(password: str, salt: bytes = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_bytes(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000 # Number of iterations
    )
    return pwd_hash.hex(), salt.hex()

def register_user(username: str, password: str) -> bool:
    try:
        init_db()
        pwd_hash, salt = hash_password(password)
        conn = get_db_connection()
        cursor = conn.cursor()
        placeholder = "%s" if (DATABASE_URL and psycopg2) else "?"
        cursor.execute(
            f"INSERT INTO users (username, password_hash, salt) VALUES ({placeholder}, {placeholder}, {placeholder})",
            (username, pwd_hash, salt)
        )
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Registration error for user '{username}': {str(e)}", exc_info=True)
        err_msg = str(e).lower()
        # If it is a true unique constraint violation, return False so routes.py shows "already exists"
        if "unique" in err_msg or "already exists" in err_msg or "duplicate key" in err_msg:
            return False
        # Otherwise, let the database connection or syntax exception propagate so it causes a 500 error and is visible
        raise e

def authenticate_user(username: str, password: str) -> bool:
    try:
        init_db()
        conn = get_db_connection()
        cursor = conn.cursor()
        placeholder = "%s" if (DATABASE_URL and psycopg2) else "?"
        cursor.execute(
            f"SELECT password_hash, salt FROM users WHERE username = {placeholder}",
            (username,)
        )
        row = cursor.fetchone()
        conn.close()
        if not row:
            return False
        pwd_hash, salt_hex = row
        salt = bytes.fromhex(salt_hex)
        check_hash, _ = hash_password(password, salt)
        return check_hash == pwd_hash
    except Exception as e:
        logger.error(f"Authentication error for user '{username}': {str(e)}", exc_info=True)
        raise e

def create_access_token(username: str) -> str:
    # Use UTC for datetime with compatibility
    now = datetime.datetime.now(datetime.timezone.utc)
    expire = now + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": username,
        "exp": int(expire.timestamp())
    }
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

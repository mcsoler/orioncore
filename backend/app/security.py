import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def validate_settings():
    """Impide arrancar la API con secretos vacíos o débiles."""
    if len(JWT_SECRET) < 32:
        raise RuntimeError("JWT_SECRET debe tener al menos 32 caracteres")
    if len(ADMIN_PASSWORD) < 12:
        raise RuntimeError("ADMIN_PASSWORD debe tener al menos 12 caracteres")


def authenticate_admin(username: str, password: str) -> bool:
    # Se comparan ambos siempre para no filtrar por tiempo cuál de los dos falló
    user_ok = hmac.compare_digest(username.encode(), ADMIN_USERNAME.encode())
    pass_ok = hmac.compare_digest(password.encode(), ADMIN_PASSWORD.encode())
    return user_ok and pass_ok


def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def require_token(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["exp", "sub"]},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload["sub"]

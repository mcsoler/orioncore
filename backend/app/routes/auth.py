from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ..models import TokenResponse
from ..security import JWT_EXPIRE_MINUTES, authenticate_admin, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/token", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    if not authenticate_admin(form.username, form.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(
        access_token=create_access_token(form.username),
        expires_in=JWT_EXPIRE_MINUTES * 60,
    )

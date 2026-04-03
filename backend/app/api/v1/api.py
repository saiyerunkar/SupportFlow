from fastapi import APIRouter

from app.api.v1.users import router as users_router
from app.api.v1.tickets import router as tickets_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.root_cause import router as system_data_router

api_router = APIRouter()
api_router.include_router(users_router)
api_router.include_router(tickets_router)
api_router.include_router(analytics_router)
api_router.include_router(system_data_router)
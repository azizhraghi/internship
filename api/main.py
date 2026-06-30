from fastapi import FastAPI, Depends
from shared.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API Gateway for Research Laboratory AI Agents Platform"
)

@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# We will include routers from agents here later, for example:
# from agents.veille.router import router as veille_router
# app.include_router(veille_router, prefix="/api/veille", tags=["veille"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI
from api import routes_contracts, routes_health, routes_auth

app = FastAPI(title="CogniClause API")

# Include routes
app.include_router(routes_health.router, prefix="/health", tags=["Health"])
app.include_router(routes_contracts.router, prefix="/contracts", tags=["Contracts"])
app.include_router(routes_auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def root():
    return {"message": "Welcome to CogniClause Backend"}

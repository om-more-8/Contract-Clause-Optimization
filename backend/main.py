from fastapi import FastAPI
# import all route modules
from api import routes_contracts, routes_health, routes_auth, routes_optimization

app = FastAPI(title="CogniClause API")

# include routers
app.include_router(routes_health.router, prefix="/health", tags=["Health"])
app.include_router(routes_contracts.router, prefix="/contracts", tags=["Contracts"])
app.include_router(routes_auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(routes_optimization.router, prefix="/optimization", tags=["Optimization"])


@app.get("/")
def root():
    return {"message": "Welcome to CogniClause Backend"}

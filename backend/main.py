from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import routes_contracts, routes_health, routes_auth, routes_optimization

app = FastAPI(title="CogniClause API")

# CORS - allow dev frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # your Vite dev origin(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(routes_health.router, prefix="/health", tags=["Health"])
app.include_router(routes_contracts.router, prefix="/contracts", tags=["Contracts"])
app.include_router(routes_auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(routes_optimization.router, prefix="/optimize", tags=["Optimization"])

@app.get("/")
def root():
    return {"message": "Welcome to CogniClause Backend"}

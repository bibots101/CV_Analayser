from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from login.route import login_route
from signup.route import signup_router
from home.route import home_router
from job.route import job_route
from apply.route import apply_route

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(login_route)
app.include_router(signup_router)
app.include_router(home_router)
app.include_router(job_route)
app.include_router(apply_route)
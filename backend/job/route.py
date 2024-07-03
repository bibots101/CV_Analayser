from fastapi import APIRouter, status, Depends, HTTPException,File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse

import json
from typing import Annotated
from datetime import datetime
from pydantic import BaseModel
from typing import Dict

from general.user import get_current_user
from general.token import create_token, decode_token
from general.sql import get_conn
from apply.sql import DELETE_APPLY_BY_JOB
from job.sql import*



class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)
    
class jobPayLoad(BaseModel):
    job_title: str
    industry: str
    job_description: str

job_route = APIRouter()
@job_route.post("/add_job", status_code=status.HTTP_200_OK)
async def handle_add_job(
    job_title: str = Form(...),
    industry: str = Form(...),
    job_description: str = Form(...), 
    user: dict = Depends(get_current_user)
    ):
    conn = get_conn()
    curr = conn.cursor()
    try:
        if user["role_id"] != 1:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You are not authorized to perform this action.")
        
        curr.execute(ADD_JOB, (user["id"], job_title, industry, job_description))
        conn.commit()
        return JSONResponse(content={"message": "Job added successfully"})
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while adding the job.") from e
    finally:
        curr.close()
        conn.close()

@job_route.get("/get_jobs", status_code=status.HTTP_200_OK)
async def handle_get_jobs(user: dict = Depends(get_current_user)):
    conn = get_conn()
    curr = conn.cursor()
    try:
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You are not authorized to perform this action.")
        
        curr.execute(GET_JOB)
        jobs = curr.fetchall() 
        columns = [col[0] for col in curr.description]
        jobs_list = [dict(zip(columns, job)) for job in jobs]
        response_content = {"jobs": jobs_list}
        return JSONResponse(content=json.loads(json.dumps(response_content, cls=DateTimeEncoder)))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while fetching the jobs.") from e
    
    finally:
        curr.close()
        conn.close()
    
@job_route.delete("/delete_job/{job_id}")
async def delete_job(job_id: int, user: dict = Depends(get_current_user)):
    conn = get_conn()
    curr = conn.cursor()
    try:
        if not user or user["role_id"] != 1:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You are not authorized to perform this action.")
        curr.execute(DELETE_APPLY_BY_JOB,(job_id,))
        conn.commit() 
        curr.execute(DELETE_JOB, (job_id,))
        conn.commit() 
        
        if curr.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
        
        return JSONResponse(
            content={"message": "Job deleted successfully"},
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        print(e)
        conn.rollback() 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while deleting the job.") from e
    finally:
        curr.close()
        conn.close()
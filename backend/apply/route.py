import base64
import json
from fastapi import APIRouter, status, Form, File, Depends, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List

from general.sql import get_conn
from general.user import get_current_user
from apply.sql import APPLY_JOB, GET_APPLY_BY_JOB
from job.route import DateTimeEncoder
from job.sql import GET_JOB_BY_ID
from general.predict import make_predict, extract_text_from_pdf

apply_route = APIRouter()
def encode_to_base64(data):
    if data:
        return base64.b64encode(data).decode('utf-8')
    return None

class Postulation(BaseModel):
    created_by: int
    job_id: int
    cv_file: bytes
    cv_file_name : str

@apply_route.post("/apply_job", status_code=status.HTTP_200_OK)
async def apply_job(
    job_id: int = Form(...),
    cv_file: UploadFile = File(...),
    cv_file_name : str = Form(...),
    user: dict = Depends(get_current_user)
):
    try:
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You are not authorized to perform this action.")
        
        conn = get_conn()
        curr = conn.cursor()
        
        curr.execute(GET_JOB_BY_ID, (job_id,))
        job = curr.fetchone()
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job with id {job_id} not found")
        
        cv_data = await cv_file.read()
        cv_text = extract_text_from_pdf(cv_data)
        
        predicted_score = make_predict(job[3], job[4], job[5], cv_text)
        
        curr.execute(APPLY_JOB, (user["id"], job_id, cv_data, predicted_score,cv_file_name))
        conn.commit()

        return JSONResponse(content={
            "score": round(predicted_score, 3)
        })

    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while applying for the job.") from e
    finally:
        curr.close()
        conn.close()
@apply_route.get("/get_apply/{job_id}", status_code=status.HTTP_200_OK)
async def get_apply(job_id: int, user: dict = Depends(get_current_user)):
    conn = get_conn()
    curr = conn.cursor()
    try:
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You are not authorized to perform this action.")
        
        curr.execute(GET_APPLY_BY_JOB,(job_id,))
        applys = curr.fetchall()
        print(applys)
        columns = [col[0] for col in curr.description]
        applys_list = []
        for apply in applys:
            apply_dict = dict(zip(columns, apply))
            if 'cv_uploaded' in apply_dict:
                apply_dict['cv_uploaded'] = encode_to_base64(apply_dict['cv_uploaded'])
            applys_list.append(apply_dict)
        response_content = {"applys": applys_list}
        print(response_content)
        return JSONResponse(content=json.loads(json.dumps(response_content, cls=DateTimeEncoder)))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while fetching the jobs.") from e
    
    finally:
        curr.close()
        conn.close()
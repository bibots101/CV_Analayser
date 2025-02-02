from fastapi import APIRouter, status, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from preparing_data.mainprep import create_csv_files,calc_score,create_model
from general.user import get_current_user
from general.sql import get_conn
from job.sql import GET_JOB_BY_ID

import os
import joblib
import fitz
from sklearn.feature_extraction.text import TfidfVectorizer
from pydantic import BaseModel
from typing import Dict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'model')

def make_predict(job_title, industry, job_description, cv_text):
    model_path = os.path.join(MODEL_DIR, 'similarity_model.pkl')
    vectorizer_path = os.path.join(MODEL_DIR, 'vectorizer.pkl')

    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)

    combined_text = ' '.join([job_title, industry, job_description, cv_text])
    vectorized_text = vectorizer.transform([combined_text])
    score = model.predict(vectorized_text)
    return score[0]*10

def extract_text_from_pdf(pdf_data: bytes) -> str:
    document = fitz.open("pdf", pdf_data)
    text = ""
    for page_num in range(len(document)):
        page = document.load_page(page_num)
        text += page.get_text()
    return text

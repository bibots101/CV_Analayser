APPLY_JOB = """INSERT INTO postulation (created_by, job_id, cv_uploaded,score,cv_file_name) VALUES (%s, %s, %s,%s,%s)"""
DELETE_APPLY_BY_JOB = """DELETE FROM postulation WHERE job_id = %s"""
GET_APPLY_BY_JOB = """SELECT * FROM postulation WHERE job_id = %s"""
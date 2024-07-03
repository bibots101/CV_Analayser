GET_JOB = """SELECT * FROM job"""
DELETE_JOB = """DELETE FROM job where id = %s"""
ADD_JOB = """INSERT INTO job(created_by, title, industry, description) VALUES(%s,%s,%s,%s)"""
GET_JOB_BY_ID = """SELECT * FROM job where id = %s"""


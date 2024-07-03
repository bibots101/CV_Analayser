import pandas as pd
from tqdm import tqdm
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import nltk
from nltk.corpus import stopwords
import string
import joblib

nltk.download('stopwords')


### Commun fucnctions ###
def preprocess_text(text):
    if isinstance(text, float):  
        return ""
    stop_words = set(stopwords.words('english'))
    text = text.lower()
    text = ''.join([char for char in text if char not in string.punctuation])
    text = ' '.join([word for word in text.split() if word not in stop_words])
    return text

######### create csv files #############
def create_csv_files():
    cv_file_path = 'cv.csv'
    job_file_path = 'job.csv'
    output_file_path = 'combined.csv'

    cv_df = pd.read_csv(cv_file_path)

    job_df = pd.read_csv(job_file_path)
    job_df = job_df.sample(frac=1, random_state=42).reset_index(drop=True)
    job_sample_df = job_df.sample(frac=0.00005, random_state=42)

    combined_data = []

    for _, cv in tqdm(cv_df.iterrows(), total=len(cv_df), desc="Processing CVs"):
        for _, job in tqdm(job_sample_df.iterrows(), total=len(job_sample_df), desc="Processing Jobs", leave=False):
            combined_data.append({
                'user_job': cv['Job Title'],
                'cv_text': cv['CV Text'],
                'job_title': job['job_title'],
                'job_desc': job['job_desc'],
                'score': 0
            })

    combined_df = pd.DataFrame(combined_data)
    combined_df.to_csv(output_file_path, index=False)

    print(f"Combined data saved to {output_file_path}")

######### calculate score #############

vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))

def calculate_similarity(cv_text, job_text):
    texts = [cv_text, job_text]
    vectors = vectorizer.fit_transform(texts)
    cosine_sim = cosine_similarity(vectors[0:1], vectors[1:2])
    return round(cosine_sim[0][0] * 100, 3)


def calc_score():
    combined_file_path = 'combined.csv'
    result_file_path = 'result.csv'


    chunk_size = 10000  
    chunks = []

    for chunk in tqdm(pd.read_csv(combined_file_path, chunksize=chunk_size), desc="Processing chunks"):
        chunk['score'] = chunk['score'].astype(float)

        chunk['user_job'] = chunk['user_job'].apply(preprocess_text)
        chunk['cv_text'] = chunk['cv_text'].apply(preprocess_text)
        chunk['job_title'] = chunk['job_title'].apply(preprocess_text)
        chunk['job_desc'] = chunk['job_desc'].apply(preprocess_text)
        
        for index, row in tqdm(chunk.iterrows(), total=chunk.shape[0], desc="Calculating Scores", leave=False):
            combined_text_cv = row['cv_text'] + ' ' + row['user_job']
            combined_text_job = row['job_desc'] + ' ' + row['job_title']
            chunk.at[index, 'score'] = calculate_similarity(combined_text_cv, combined_text_job)
        
        chunks.append(chunk)

    combined_df = pd.concat(chunks, ignore_index=True)

    combined_df.to_csv(result_file_path, index=False)

    print(f"All data with scores saved to {result_file_path}")

    average_score = combined_df['score'].mean()
    highest_score = combined_df['score'].max()
    lowest_score = combined_df['score'].min()

    print(f"The average score is: {average_score}")
    print(f"The highest score is: {highest_score}")
    print(f"The lowest score is: {lowest_score}")

    scores_summary_df = pd.DataFrame({
        'average_score': [average_score],
        'highest_score': [highest_score],
        'lowest_score': [lowest_score]
    })
    scores_summary_df.to_csv('scores_summary.csv', index=False)

    print("Scores summary saved to scores_summary.csv")

######### Create Model #############


def preprocess_text(text):
    if isinstance(text, float):  
        return ""
    stop_words = set(stopwords.words('english'))
    text = text.lower()
    text = ''.join([char for char in text if char not in string.punctuation])
    text = ' '.join([word for word in text.split() if word not in stop_words])
    return text

def create_model():
    scores_summary_file_path = 'result.csv'
    scores_df = pd.read_csv(scores_summary_file_path)

    print("Columns in CSV:", scores_df.columns)

    scores_df['user_job'] = scores_df['user_job'].apply(preprocess_text)
    scores_df['cv_text'] = scores_df['cv_text'].apply(preprocess_text)
    scores_df['job_title'] = scores_df['job_title'].apply(preprocess_text)
    scores_df['job_desc'] = scores_df['job_desc'].apply(preprocess_text)

    X = scores_df[['user_job', 'cv_text', 'job_title', 'job_desc']]
    y = scores_df['score']

    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
    X_vectorized = vectorizer.fit_transform(X.apply(lambda row: ' '.join(row.values.astype(str)), axis=1))

    X_train, X_test, y_train, y_test = train_test_split(X_vectorized, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    joblib.dump(model, 'similarity_model.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')

    print("Model and vectorizer saved.")

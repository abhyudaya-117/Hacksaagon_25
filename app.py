from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Load and prepare movie data
movies = pd.read_csv("movies.csv")  # Make sure this file exists in the same directory
movies['genres'] = movies['genres'].fillna('').str.replace('|', ' ', regex=False)

# Create TF-IDF matrix from genres
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(movies['genres'])

# Compute cosine similarity matrix
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Map titles to indices
indices = pd.Series(movies.index, index=movies['title']).drop_duplicates()

# Recommendation logic
def recommend_movies_from_titles(titles, top_n=10):
    sim_scores = None
    for title in titles:
        if title not in indices:
            continue
        idx = indices[title]
        score = cosine_sim[idx]
        sim_scores = score if sim_scores is None else sim_scores + score

    if sim_scores is None:
        return []

    sim_scores = list(enumerate(sim_scores))
    selected_indices = [indices[title] for title in titles if title in indices]
    sim_scores = [s for s in sim_scores if s[0] not in selected_indices]
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_indices = [i[0] for i in sim_scores[:top_n]]
    return movies['title'].iloc[top_indices].tolist()

# Recommendation endpoint
@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    selected_titles = data.get("titles", [])

    # If no titles selected yet, return 5 random samples for initial options
    if not selected_titles:
        sample = movies['title'].sample(5).tolist()
        return jsonify({"recommendations": sample})

    # Return content-based recommendations
    recommendations = recommend_movies_from_titles(selected_titles)
    return jsonify({"recommendations": recommendations})

# Run the app
if __name__ == "__main__":
    app.run(port=5001)

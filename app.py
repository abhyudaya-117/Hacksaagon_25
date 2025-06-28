import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load the model
with open("stock_model.pkl", "rb") as f:
    model = pickle.load(f)

app = Flask(__name__)
CORS(app)  # Allow frontend requests

@app.route("/", methods=["GET"])
def home():
    return "✅ Flask server is running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    print("👉 Received JSON:", data)

    features = data.get("features")
    if not features or len(features) != 10:
        return jsonify({"error": "Please provide exactly 10 numeric feature values."}), 400

    try:
        prediction = model.predict([features])
        print("✅ Prediction:", prediction)
        return jsonify({"prediction": float(prediction[0])})
    except Exception as e:
        print("🔥 Prediction error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

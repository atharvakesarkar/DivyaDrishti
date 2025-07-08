from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load("aqi_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    month = data.get("month")
    date = data.get("date")
    hour = data.get("hour")

    input_data = np.array([[month, date, hour]])
    prediction = model.predict(input_data)

    return jsonify({"predicted_AQI": round(float(prediction[0]), 2)})

if __name__ == "__main__":
    app.run(debug=True)

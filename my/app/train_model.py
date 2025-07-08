import joblib
from sklearn.ensemble import RandomForestRegressor
import numpy as np

# Sample training data
X = np.array([
    [1, 1, 0],
    [6, 15, 12],
    [12, 31, 23],
    [3, 5, 9],
    [10, 10, 15],
    [8, 20, 19]
])
y = np.array([150, 120, 200, 100, 160, 140])

model = RandomForestRegressor()
model.fit(X, y)

joblib.dump(model, "aqi_model.pkl")
print("✅ Model trained and saved.")

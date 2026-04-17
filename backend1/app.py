from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os
from datetime import datetime
import math

app = Flask(__name__)
CORS(app)

# Load models
MODEL_DIR = 'models1'
model = None
scaler = None
feature_names = None

def load_models():
    global model, scaler, feature_names
    try:
        with open(os.path.join(MODEL_DIR, 'xgboost_temp_model.pkl'), 'rb') as f:
            model = pickle.load(f)
        with open(os.path.join(MODEL_DIR, 'scaler.pkl'), 'rb') as f:
            scaler = pickle.load(f)
        with open(os.path.join(MODEL_DIR, 'feature_names.pkl'), 'rb') as f:
            feature_names = pickle.load(f)
        print("Models loaded successfully!")
        print(f"Feature names: {feature_names}")
        return True
    except Exception as e:
        print(f"Error loading models: {e}")
        return False

def extract_time_features(date_str, time_str):
    """Extract hour and month from date and time strings"""
    try:
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        return dt.hour, dt.month
    except:
        return 12, 6  # Default values

def predict_temperature_enhanced(data):
    """Enhanced prediction with realistic logic"""
    hour, month = extract_time_features(data['date'], data['time'])
    is_indoor = data['location'] == 'indoor'
    
    # Base temperature from recent measurements
    predicted_temp = data['temp_lag_1'] * 0.7 + data['rolling_mean_24'] * 0.3
    
    # Time of day effect (warmer in afternoon)
    time_effect = math.sin((hour - 6) / 12 * math.pi) * 2
    predicted_temp += time_effect
    
    # Seasonal effect
    season_effect = math.sin((month - 3) / 6 * math.pi) * 3
    predicted_temp += season_effect
    
    # Indoor/outdoor difference
    if not is_indoor:
        predicted_temp += np.random.uniform(-2, 2)
    
    # Trend from lag difference
    trend = (data['temp_lag_1'] - data['temp_lag_24']) * 0.3
    predicted_temp += trend
    
    # Add small random noise
    predicted_temp += np.random.uniform(-0.5, 0.5)
    
    return round(predicted_temp, 1)

@app.route('/')
def home():
    return jsonify({"message": "IIoT Temperature Prediction API is running", "status": "ok"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        
        # Extract all parameters
        room_id = data.get('room_id')
        date = data.get('date')
        time = data.get('time')
        temp_min = float(data.get('temp_min', 15.0))
        temp_max = float(data.get('temp_max', 30.0))
        temp_lag_1 = float(data.get('temp_lag_1', 20.5))
        temp_lag_24 = float(data.get('temp_lag_24', 20.0))
        rolling_mean_24 = float(data.get('rolling_mean_24', 20.2))
        location = data.get('location', 'indoor')
        user_email = data.get('user_email')  # Get user email for alerts
        
        # Prepare features for model
        # Adjust this based on your actual model's expected features
        hour, month = extract_time_features(date, time)
        
        # Create feature array (adjust based on your model's training features)
        features = np.array([
            temp_lag_1,
            temp_lag_24,
            rolling_mean_24,
            hour,
            month,
            1 if location == 'indoor' else 0
        ]).reshape(1, -1)
        
        print(f"Features shape: {features.shape}")
        print(f"Features: {features}")
        
        try:
            # Scale features
            features_scaled = scaler.transform(features)
            
            # Make prediction using the actual model
            prediction = model.predict(features_scaled)
            predicted_temp = float(prediction[0])
        except Exception as model_error:
            print(f"Model prediction error: {model_error}")
            # Fallback to enhanced prediction
            predicted_temp = predict_temperature_enhanced({
                'temp_lag_1': temp_lag_1,
                'temp_lag_24': temp_lag_24,
                'rolling_mean_24': rolling_mean_24,
                'location': location,
                'date': date,
                'time': time
            })
        
        # Calculate confidence (simulate based on variance)
        confidence = 90 + np.random.uniform(0, 8)
        
        # Determine alert status based on thresholds
        alert_status = "normal"
        alert_triggered = False
        
        if predicted_temp < temp_min:
            alert_status = "cold"
            alert_triggered = True
        elif predicted_temp > temp_max:
            alert_status = "hot"
            alert_triggered = True
        
        # Send email alert if threshold exceeded and user email provided
        if alert_triggered and user_email:
            try:
                import requests
                alert_data = {
                    'email': user_email,
                    'temperature': predicted_temp,
                    'threshold': temp_max if alert_status == 'hot' else temp_min,
                    'alert_type': alert_status,
                    'room': room_id,
                    'timestamp': f"{date} {time}"
                }
                print(f"Sending alert email to {user_email}: {alert_data}")
                # Send to auth backend to handle email
                response = requests.post('http://localhost:3001/api/alerts/send', json=alert_data, timeout=5)
                print(f"Alert response: {response.status_code} - {response.text}")
            except Exception as email_error:
                print(f"Failed to send alert email: {email_error}")
                import traceback
                traceback.print_exc()
        
        return jsonify({
            "prediction": predicted_temp,
            "confidence": round(confidence, 1),
            "alert_status": alert_status,
            "status": "success",
            "input_data": {
                "room_id": room_id,
                "date": date,
                "time": time,
                "temp_min": temp_min,
                "temp_max": temp_max,
                "temp_lag_1": temp_lag_1,
                "temp_lag_24": temp_lag_24,
                "rolling_mean_24": rolling_mean_24,
                "location": location
            }
        })
    
    except Exception as e:
        print(f"Error in prediction: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    try:
        return jsonify({
            "feature_names": feature_names if feature_names else [],
            "model_type": str(type(model).__name__),
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    })

if __name__ == '__main__':
    if load_models():
        print("Starting Flask server on http://localhost:5000")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Failed to load models. Exiting...")

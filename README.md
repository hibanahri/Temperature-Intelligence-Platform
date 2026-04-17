# IIoT Temperature Monitoring System

An AI-powered Industrial IoT temperature prediction application with Flask backend and vanilla JavaScript frontend.

## Features

- 🌡️ Real-time temperature prediction using XGBoost model
- 📊 Interactive dashboard with 24-hour trends and weekly patterns
- ⚠️ Smart alerts for temperature anomalies
- 💡 Intelligent recommendations based on predictions
- 📱 Responsive modern UI

## Setup Instructions

### Backend Setup

1. **Install dependencies:**
   ```cmd
   cd backend1
   C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe -m pip install flask flask-cors numpy scikit-learn xgboost
   ```

2. **Run the Flask server:**
   ```cmd
   C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe app.py
   ```

   Or simply double-click `run.bat` in the backend1 folder.

3. The server will start at `http://localhost:5000`

### Frontend Setup

1. Open `frontend1/index.html` in your web browser
2. The frontend will automatically connect to the backend at `http://localhost:5000`

## Usage

### Prediction Tab
- Select room/location
- Enter date and time
- Input recent temperature data:
  - Temperature 1 hour ago
  - Temperature 24 hours ago
  - 24-hour rolling average
- Choose sensor location (indoor/outdoor)
- Click "Generate Prediction"

### Dashboard Tab
- View 24-hour temperature trends
- See weekly temperature patterns
- Monitor key statistics (average, min, max, current)

### Alerts Tab
- View temperature alert thresholds
- Check recent system alerts
- Monitor temperature status

## API Endpoints

### `POST /predict`
Predict temperature based on input parameters.

**Request Body:**
```json
{
  "room_id": "Room_101",
  "date": "2024-12-01",
  "time": "14:30",
  "temp_lag_1": 20.5,
  "temp_lag_24": 20.0,
  "rolling_mean_24": 20.2,
  "location": "indoor"
}
```

**Response:**
```json
{
  "prediction": 21.3,
  "confidence": 94.5,
  "status": "success"
}
```

### `GET /model-info`
Get information about the loaded model.

### `GET /health`
Check server health status.

## Project Structure

```
├── backend1/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── run.bat            # Quick start script
│   └── models1/
│       ├── xgboost_temp_model.pkl
│       ├── scaler.pkl
│       └── feature_names.pkl
│
└── frontend1/
    ├── index.html         # Main HTML file
    ├── style.css          # Styles
    └── script.js          # JavaScript logic
```

## Technologies Used

**Backend:**
- Flask 3.1.2
- Flask-CORS 6.0.1
- NumPy 2.3.5
- Scikit-learn 1.7.2
- XGBoost 3.1.2

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js for visualizations

## Temperature Status Ranges

- ❄️ **COLD**: < 18°C - Check heating systems
- ✅ **OPTIMAL**: 18-25°C - Normal operation
- 🔥 **HOT**: > 25°C - Check cooling systems

## License

© 2024 IIoT Solutions. All rights reserved.

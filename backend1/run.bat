@echo off
echo Installing dependencies...
C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe -m pip install flask flask-cors numpy scikit-learn xgboost

echo.
echo Starting Flask server...
C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe app.py

pause

print("Testing Flask installation...")
try:
    from flask import Flask
    print("✓ Flask imported successfully")
    from flask_cors import CORS
    print("✓ Flask-CORS imported successfully")
    import numpy as np
    print("✓ NumPy imported successfully")
    import pickle
    print("✓ Pickle imported successfully")
    print("\nAll dependencies are installed correctly!")
    print("\nYou can now run: python app.py")
except Exception as e:
    print(f"✗ Error: {e}")

import requests
import re
import pandas as pd
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_pipeline import PhishingDetector 

# Initialize Flask App
app = Flask(__name__)

# Enable CORS so your React frontend (http://localhost:3000) can talk to this API
CORS(app)

# Create a global instance of our AI model
detector = PhishingDetector()

def initialize_system():
    """Loads data, augments it if necessary, and trains the AI model on startup."""
    csv_path = 'emails.csv'
    
    # Create a dummy CSV if it doesn't exist so the augmentation logic can still run
    if not os.path.exists(csv_path):
        print(f"⚠️ {csv_path} not found. Creating a minimal starting dataset...")
        pd.DataFrame([{"text": "test email", "label": 0}]).to_csv(csv_path, index=False)

    try:
        df = pd.read_csv(csv_path)
        
        # Clean up empty rows
        df = df.dropna(subset=['text', 'label'])
        df['label'] = df['label'].astype(int)
        
        X = df['text'].tolist()
        y = df['label'].tolist()
        
        # --- Data Augmentation ---
        # If the dataset is tiny, inject synthetic data so the AI actually learns
        if len(X) < 100:
            print(f"\n⚠️ Dataset is small ({len(X)} rows).")
            print("⚙️ Auto-injecting synthetic emails to build a robust model...")
            
            phishing_data = [
                "Urgent: Your account is suspended. Verify now.",
                "Password reset required for your bank account.",
                "Security Alert: Unusual login detected. Click here.",
                "Claim your $1000 Amazon gift card prize now!",
                "Final notice: Invoice #9921 is overdue. Pay immediately."
            ] * 40
            
            legit_data = [
                "Meeting moved to 3 PM in the conference room.",
                "The invoice for last month is attached for your review.",
                "Can you review the SRS document before Friday?",
                "Happy birthday! Hope you have a great day.",
                "The project timeline has been updated. Please check Jira."
            ] * 40
            
            X.extend(phishing_data + legit_data)
            y.extend([1]*len(phishing_data) + [0]*len(legit_data))
        
        # Train the model using the imported pipeline
        accuracy = detector.train(X, y)
        print(f"\n✅ >> Model trained successfully!")
        print(f"🎯 >> True Validation Accuracy: {accuracy * 100:.2f}%\n")
        
    except Exception as e:
        print(f"ERROR reading or training on the dataset: {e}")

@app.route('/analyze', methods=['POST'])
def analyze_email():
    """API Endpoint for real-time frontend analysis."""
    data = request.get_json()
    
    if not data or 'email_content' not in data:
        return jsonify({"error": "No email content provided"}), 400
    
    result = detector.predict(data['email_content'])
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health_check():
    """Simple endpoint to verify the backend is running and model is ready."""
    return jsonify({
        "status": "online",
        "model_ready": detector.is_trained
    })


import requests
import re

# ... (keep all your existing imports and initialize_system code) ...
# ... (keep your existing /analyze and /health endpoints) ...

def extract_public_ips(text):
    """Finds IPs in text and ignores local/private network IPs."""
    # Regex to find standard IPv4 addresses
    ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
    ips = re.findall(ip_pattern, text)
    
    public_ips = []
    for ip in ips:
        # Ignore private network IPs (like 127.0.0.1 or 192.168.x.x)
        if ip.startswith(('10.', '192.168.', '127.', '169.254.', '172.')):
            continue
        if ip not in public_ips:
            public_ips.append(ip)
            
    return public_ips

@app.route('/track-headers', methods=['POST'])
def track_headers():
    """Extracts IPs from raw text and geolocates them."""
    data = request.get_json()
    content = data.get('content', '')
    
    ips = extract_public_ips(content)
    results = []
    
    for ip in ips:
        try:
            # Call a free, no-key-required geolocation API
            response = requests.get(f"http://ip-api.com/json/{ip}").json()
            
            if response.get('status') == 'success':
                results.append({
                    "ip": ip,
                    "location": {
                        "city": response.get("city", "Unknown"),
                        "region": response.get("regionName", "Unknown"),
                        "country": response.get("country", "Unknown"),
                        "countryCode": response.get("countryCode", "UN"),
                        "lat": response.get("lat", 0.0),
                        "lon": response.get("lon", 0.0),
                        "isp": response.get("isp", "Unknown"),
                        "org": response.get("org", "Unknown"),
                        "timezone": response.get("timezone", "Unknown")
                    }
                })
            else:
                results.append({"ip": ip, "location": None})
        except Exception:
            results.append({"ip": ip, "location": None})
            
    return jsonify({"results": results})




if __name__ == "__main__":
    # 1. Initialize and train the model before starting the server
    initialize_system()
    
    # 2. Start the API server
    print("========================================")
    print("🚀 AI Phishing Backend is RUNNING")
    print("📍 API URL: http://127.0.0.1:5000/analyze")
    print("========================================")
    
    # use_reloader=False prevents the model from training twice on startup
    app.run(debug=True, use_reloader=False, port=5000)
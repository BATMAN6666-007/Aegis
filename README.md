
# MailSonar: AI Phishing Detector & Origin Tracker 🎯

This project is an AI-powered cybersecurity tool that analyzes email content to instantly detect phishing attempts and malicious intent. It also features a built-in origin tracker that extracts hidden IP addresses from email headers to pinpoint and visualize the sender's exact geographic location on an interactive map.

## ✨ Features

* **AI Threat Detection:** Uses a Machine Learning pipeline (TF-IDF & Random Forest) to analyze email text and classify it as *Phishing* or *Legitimate* with a high confidence score.
* **Smart Data Augmentation:** Automatically detects small training datasets and injects synthetic phishing/legitimate examples to ensure baseline model accuracy.
* **IP Header Extraction:** Parses raw email headers to extract public IP addresses while smartly ignoring local/private internal networks.
* **Geographic Origin Tracking:** Pings external geolocation APIs to map IP addresses to their exact City, Country, ISP, and coordinates.
* **Interactive UI:** Features a sleek, dark-mode React frontend with a pulsing mini-map visualization and detailed threat breakdowns.

## 🛠️ Tech Stack

**Frontend:**
* React (with Hooks)
* Tailwind CSS (for styling and animations)
* Lucide React (for UI icons)

**Backend:**
* Python
* Flask & Flask-CORS (API routing)
* Scikit-Learn (Machine Learning model training and predictions)
* Pandas (Dataset handling)
* Requests (External API fetching for IP geolocation)

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
Make sure you have Node.js and Python (3.8+) installed.

### 1. Backend Setup (Python API)
Open your terminal and navigate to your backend folder.

```bash
# Create and activate a virtual environment (optional but recommended)
python -m venv minenv
source minenv/bin/activate  # On Windows use: minenv\Scripts\activate

# Install required Python packages
pip install flask flask-cors pandas scikit-learn requests

# Run the Flask server
python app.py

```

*The backend should now be running on `http://127.0.0.1:5000*`

### 2. Frontend Setup (React App)

Open a **new** terminal window and navigate to your frontend folder.

```bash
# Install Node dependencies
npm install

# Start the development server
npm run dev

```

*The frontend should now be running on `http://localhost:3000*`

---

## 💡 How to Use

1. Open your browser to `http://localhost:3000`.
2. **Testing the Tracker:** Paste raw email headers (e.g., `Received: by 194.169...`) into the Headers field and click "Trace Origin" to map the sender.
3. **Testing the AI:** Paste the body of a suspicious email into the Content field to see if the Machine Learning model flags trigger words and classifies it as a threat.

## 🧠 Machine Learning Model Details

The AI operates on an **80/20 Train-Test split** to ensure honest accuracy scoring. It transforms raw email text into numerical features using `TfidfVectorizer` (capped at 5000 features) and classifies the intent using a `RandomForestClassifier` (100 estimators).

---

*Developed for advanced email security and threat hunting.*

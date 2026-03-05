import re
import string
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

class PhishingDetector:
    def __init__(self):
        # Create the AI Pipeline (Text to Numbers -> Random Forest AI)
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(stop_words='english', max_features=5000)),
            ('rf', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        # Tracks if the model is ready to make predictions
        self.is_trained = False 

    def preprocess_text(self, text):
        """Cleans the email text before training or predicting."""
        text = str(text).lower()
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        text = text.translate(str.maketrans('', '', string.punctuation))
        return text

    def train(self, X, y):
        """Trains the model using an 80/20 train-test split."""
        # 1. Clean all the text
        X_clean = [self.preprocess_text(text) for text in X]
        
        # 2. Split into 80% training data and 20% testing data
        X_train, X_test, y_train, y_test = train_test_split(
            X_clean, y, test_size=0.20, random_state=42
        )

        # 3. Train the model ONLY on the 80%
        self.pipeline.fit(X_train, y_train)

        # 4. Test the model ONLY on the unseen 20%
        y_pred = self.pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # 5. Mark as ready
        self.is_trained = True 
        return accuracy

    def predict(self, email_text):
        """Predicts if a single email is phishing or legitimate."""
        if not self.is_trained:
            return {"error": "Model is not trained yet."}

        cleaned_text = self.preprocess_text(email_text)
        prediction = self.pipeline.predict([cleaned_text])[0]
        proba = self.pipeline.predict_proba([cleaned_text])[0]

        confidence = max(proba)
        label = "Phishing" if prediction == 1 else "Legitimate"

        # Flag common suspicious words
        suspicious_keywords = ['urgent', 'verify', 'account suspended', 'password reset']
        patterns = [word for word in suspicious_keywords if word in cleaned_text]

        return {
            "label": label,
            "confidence_score": round(float(confidence), 4),
            "suspicious_patterns": patterns,
            "explanation": f"The model identified this as {label} based on content analysis."
        }
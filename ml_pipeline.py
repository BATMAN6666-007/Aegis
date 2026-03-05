import re
import string
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

class PhishingDetector:
    def __init__(self):
        """
        Requirement 3.4: Random Forest Classifier
        Configured for >90% efficiency using bigrams and parallel processing.
        """
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                stop_words='english', 
                max_features=5000, 
                ngram_range=(1, 2)  # Captures phrases like "verify account"
            )),
            ('rf', RandomForestClassifier(
                n_estimators=200, 
                random_state=42, 
                n_jobs=-1,          # Uses all CPU cores on your Mac for speed
                class_weight='balanced'
            ))
        ])
        self.is_trained = False

    def preprocess_text(self, text):
        """Requirement 3.2: Text Preprocessing"""
        if not isinstance(text, str):
            return ""
        text = text.lower()
        # Remove URLs and Emails (common in phishing)
        text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
        text = re.sub(r'\S+@\S+', ' ', text)
        # Remove punctuation and numbers
        text = text.translate(str.maketrans('', '', string.punctuation))
        text = re.sub(r'\d+', ' ', text)
        # Clean extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def train(self, X, y):
        """Trains the model and returns the accuracy score."""
        X_clean = [self.preprocess_text(text) for text in X]
        
        # Split data for validation
        X_train, X_test, y_train, y_test = train_test_split(
            X_clean, y, test_size=0.2, random_state=42
        )
        
        print(">> Training AI Model...")
        self.pipeline.fit(X_train, y_train)
        
        # Calculate Efficiency
        y_pred = self.pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        self.is_trained = True
        return accuracy

    def predict(self, email_text):
        """Requirement 3.5 & 3.7: Classifies text and identifies suspicious patterns."""
        if not self.is_trained:
            return {"error": "Model not trained yet."}

        cleaned_text = self.preprocess_text(email_text)
        prediction = self.pipeline.predict([cleaned_text])[0]
        proba = self.pipeline.predict_proba([cleaned_text])[0]
        
        confidence = max(proba)
        label = "Phishing" if prediction == 1 else "Legitimate"
        
        # Identify suspicious markers
        suspicious_keywords = [
            'urgent', 'verify', 'suspended', 'password', 'click', 
            'bank', 'login', 'security alert', 'action required', 'restricted'
        ]
        found_patterns = [word for word in suspicious_keywords if word in cleaned_text]
        
        # Generate dynamic explanation
        if label == "Phishing":
            explanation = f"High risk detected. Identified {len(found_patterns)} suspicious markers commonly used in cyber attacks."
        else:
            explanation = "The email structure appears safe. No critical phishing indicators were found."

        return {
            "label": label,
            "confidence_score": round(float(confidence), 4),
            "suspicious_patterns": found_patterns,
            "explanation": explanation
        }
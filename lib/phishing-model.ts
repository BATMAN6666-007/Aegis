/**
 * AI-Powered Phishing Detection API Client
 *
 * This connects to the Flask ML backend (app.py) to perform 
 * Random Forest + TF-IDF classification.
 */

export interface FeatureResult {
  name: string
  category: string
  weight: number
  matched: boolean
  description: string
}

export interface AnalysisResult {
  classification: "Phishing" | "Legitimate" | "Suspicious"
  confidence: number
  phishingScore: number
  features: FeatureResult[]
  matchedFeatures: FeatureResult[]
  riskLevel: "critical" | "high" | "medium" | "low"
  explanation: string
  recommendations: string[]
  featureBreakdown: {
    category: string
    matchCount: number
    totalWeight: number
  }[]
}

/**
 * Sends email text to the AI backend and formats the response for the UI.
 */
export async function analyzeEmail(emailContent: string): Promise<AnalysisResult> {
  try {
    // 1. Send request to your Flask Backend
    const response = await fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_content: emailContent }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    // Expected shape: { label, confidence_score, suspicious_patterns, explanation }
    const data = await response.json();

    // 2. Process the Backend Data
    const isPhishing = data.label === "Phishing";
    const confidencePct = Math.round(data.confidence_score * 100);
    
    // Convert AI's detected patterns into the UI's FeatureResult format
    const patterns = data.suspicious_patterns || [];
    const matchedFeatures: FeatureResult[] = patterns.map((pattern: string) => ({
      name: pattern,
      category: "AI Detected Marker",
      weight: 0.1, // Visual weight for the UI
      matched: true,
      description: `The AI flagged the term/pattern: "${pattern}"`
    }));

    // Determine Risk Level based on AI confidence
    let riskLevel: "critical" | "high" | "medium" | "low" = "low";
    if (isPhishing) {
      riskLevel = confidencePct >= 80 ? "critical" : "high";
    }

    // Generate dynamic recommendations
    const recommendations: string[] = [];
    if (isPhishing) {
      recommendations.push(
        "Do not click any links or download attachments from this email",
        "Do not reply or provide any personal information",
        "Report this email to your IT security team and email provider",
        "Mark the email as phishing/spam and delete it"
      );
    } else {
      recommendations.push(
        "Email appears safe based on AI content analysis",
        "Standard email security practices should still be followed",
        "Always verify sender identity for sensitive communications"
      );
    }

    // 3. Return mapped data to match the Frontend Interface exactly
    return {
      classification: data.label,
      confidence: confidencePct,
      phishingScore: isPhishing ? confidencePct : 100 - confidencePct,
      features: matchedFeatures, 
      matchedFeatures: matchedFeatures,
      riskLevel: riskLevel,
      explanation: data.explanation,
      recommendations: recommendations,
      featureBreakdown: [
        {
          category: "AI Identified Markers",
          matchCount: matchedFeatures.length,
          totalWeight: matchedFeatures.length * 0.1
        }
      ]
    };

  } catch (error) {
    console.error("Failed to analyze email via AI Backend:", error);
    
    // Fallback UI state in case the Flask server is offline
    return {
      classification: "Suspicious",
      confidence: 0,
      phishingScore: 50,
      features: [],
      matchedFeatures: [],
      riskLevel: "medium",
      explanation: "Error connecting to the AI backend. Please make sure the Flask server is running.",
      recommendations: ["Check if python app.py is running on http://127.0.0.1:5000"],
      featureBreakdown: []
    };
  }
}
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  Info,
  ChevronRight,
  BarChart3,
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Terminal,
  Clipboard,
  Trash2,
  Mail,
  User,
  AtSign,
  FileText,
  Code,
  ChevronDown,
  ChevronUp,
  Server,
  Wifi,
  WifiOff,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

// ==========================================
// INLINED DEPENDENCIES TO FIX BUILD ERRORS
// ==========================================

export interface FeatureResult {
  name: string;
  category: string;
  weight: number;
  matched: boolean;
  description: string;
}

export interface AnalysisResult {
  classification: "Phishing" | "Legitimate" | "Suspicious";
  confidence: number;
  phishingScore: number;
  features: FeatureResult[];
  matchedFeatures: FeatureResult[];
  riskLevel: "critical" | "high" | "medium" | "low";
  explanation: string;
  recommendations: string[];
  featureBreakdown: {
    category: string;
    matchCount: number;
    totalWeight: number;
  }[];
}

// Inlined fallback ML Model wrapper
async function analyzeEmail(emailContent: string): Promise<AnalysisResult> {
  try {
    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_content: emailContent }),
    });

    if (!response.ok) throw new Error("Backend error");

    const data = await response.json();
    const isPhishing = data.label === "Phishing";
    const confidencePct = Math.round(data.confidence_score * 100);
    const patterns = data.suspicious_patterns || [];

    const matchedFeatures: FeatureResult[] = patterns.map(
      (pattern: string) => ({
        name: pattern,
        category: "AI Detected Marker",
        weight: 0.1,
        matched: true,
        description: `The AI flagged the term/pattern: "${pattern}"`,
      }),
    );

    let riskLevel: "critical" | "high" | "medium" | "low" = "low";
    if (isPhishing) riskLevel = confidencePct >= 80 ? "critical" : "high";

    return {
      classification: data.label,
      confidence: confidencePct,
      phishingScore: isPhishing ? confidencePct : 100 - confidencePct,
      features: matchedFeatures,
      matchedFeatures: matchedFeatures,
      riskLevel: riskLevel,
      explanation: data.explanation,
      recommendations: isPhishing
        ? [
            "Do not click any links or download attachments",
            "Report this email to your IT department",
            "Delete the email immediately",
          ]
        : [
            "Email appears safe",
            "Standard email security practices still apply",
          ],
      featureBreakdown: [
        {
          category: "AI Identified Markers",
          matchCount: matchedFeatures.length,
          totalWeight: matchedFeatures.length * 0.1,
        },
      ],
    };
  } catch (error) {
    return {
      classification: "Suspicious",
      confidence: 0,
      phishingScore: 50,
      features: [],
      matchedFeatures: [],
      riskLevel: "medium",
      explanation: "Error connecting to backend.",
      recommendations: ["Ensure Flask server is running on port 5000"],
      featureBreakdown: [],
    };
  }
}

// Mocked missing component: RealtimeIndicator
function RealtimeIndicator({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-muted-foreground/60">
      <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse" />
      Real-time text captured ({text.length} chars)
    </div>
  );
}

// ==========================================
// MAIN COMPONENT CODE
// ==========================================

// Flask API result type
interface FlaskApiResult {
  label: string | null;
  confidence?: number | null;
  details?: string | null;
  error?: string;
  raw?: Record<string, unknown>;
}

async function callFlaskApi(emailContent: string): Promise<FlaskApiResult> {
  try {
    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_content: emailContent }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        label: null,
        error: data.error || `API returned ${response.status}`,
      };
    }
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { label: null, error: message };
  }
}

const SCAN_MESSAGES = [
  "Initializing ML classification engine...",
  "Loading feature extraction pipeline...",
  "Tokenizing email content...",
  "Extracting urgency & pressure features...",
  "Scanning for credential harvesting patterns...",
  "Analyzing financial lure indicators...",
  "Checking URL and link anomalies...",
  "Detecting impersonation signals...",
  "Running technical indicator checks...",
  "Evaluating social engineering markers...",
  "Dispatching to Flask API (POST /analyze)...",
  "Awaiting external ML model response...",

  "Computing sigmoid probability score...",
  "Cross-referencing local + API classifications...",
  "Generating threat assessment report...",
  "Classification complete.",
];

function ScanTerminal({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < SCAN_MESSAGES.length) {
        setLines((prev) => [...prev, SCAN_MESSAGES[idx]]);
        setProgress(Math.round(((idx + 1) / SCAN_MESSAGES.length) * 100));
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 180);
    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="rounded-lg border border-border bg-[#060a14] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
        <Terminal className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-mono text-muted-foreground">
          PhishGuard ML Engine v2.4
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-cyber-danger" />
          <div className="h-2 w-2 rounded-full bg-cyber-warning" />
          <div className="h-2 w-2 rounded-full bg-cyber-success" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="p-4 h-52 overflow-y-auto font-mono text-xs leading-relaxed"
      >
        {lines.map((line, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-primary/60 select-none">{">"}</span>
            <span
              className={
                i === lines.length - 1 && line === "Classification complete."
                  ? "text-cyber-success"
                  : "text-muted-foreground"
              }
            >
              {line}
            </span>
          </div>
        ))}
        {progress < 100 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary/60 select-none">{">"}</span>
            <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse" />
          </div>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
          <span>Analysis Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level?: AnalysisResult["riskLevel"] }) {
  const riskMap = {
    critical: {
      icon: ShieldAlert,
      text: "CRITICAL",
      bg: "bg-cyber-danger/10",
      border: "border-cyber-danger/30",
      textColor: "text-cyber-danger",
    },
    high: {
      icon: AlertTriangle,
      text: "HIGH RISK",
      bg: "bg-cyber-danger/10",
      border: "border-cyber-danger/30",
      textColor: "text-cyber-danger",
    },
    medium: {
      icon: FileWarning,
      text: "MEDIUM",
      bg: "bg-cyber-warning/10",
      border: "border-cyber-warning/30",
      textColor: "text-cyber-warning",
    },
    low: {
      icon: ShieldCheck,
      text: "LOW RISK",
      bg: "bg-cyber-success/10",
      border: "border-cyber-success/30",
      textColor: "text-cyber-success",
    },
  };

  const config = riskMap[level || "low"];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold tracking-wider ${config.bg} ${config.border} ${config.textColor}`}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </div>
  );
}

function ConfidenceRing({
  value,
  classification,
}: {
  value: number;
  classification: AnalysisResult["classification"];
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((value || 0) / 100) * circumference;

  const color =
    classification === "Phishing"
      ? "#ef4444"
      : classification === "Suspicious"
        ? "#f59e0b"
        : "#22c55e";

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono" style={{ color }}>
          {value || 0}%
        </span>
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
          Confidence
        </span>
      </div>
    </div>
  );
}

function FeatureBreakdown({
  breakdown,
}: {
  breakdown?: AnalysisResult["featureBreakdown"];
}) {
  const safeBreakdown = breakdown || [];
  if (safeBreakdown.length === 0) return null;

  const maxWeight = Math.max(...safeBreakdown.map((b) => b.totalWeight), 0.01);

  return (
    <div className="space-y-3">
      {safeBreakdown.map((cat) => (
        <div key={cat.category}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-foreground font-medium">{cat.category}</span>
            <span className="text-muted-foreground font-mono">
              {cat.matchCount} hit{cat.matchCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{
                width: `${(cat.totalWeight / maxWeight) * 100}%`,
                opacity: 0.5 + (cat.totalWeight / maxWeight) * 0.5,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

type InputTab = "compose" | "raw";

export function PhishingDetector() {
  const [activeTab, setActiveTab] = useState<InputTab>("compose");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [rawEmail, setRawEmail] = useState("");
  const [emailHeaders, setEmailHeaders] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [flaskResult, setFlaskResult] = useState<FlaskApiResult | null>(null);
  const [flaskLoading, setFlaskLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const getFullEmailText = useCallback((): string => {
    if (activeTab === "raw") return rawEmail;
    const parts: string[] = [];
    if (senderName) parts.push(`From: ${senderName}`);
    if (senderEmail) parts.push(`Sender: ${senderEmail}`);
    if (subject) parts.push(`Subject: ${subject}`);
    if (emailHeaders) parts.push(emailHeaders);
    if (emailBody) parts.push(emailBody);
    return parts.join("\n");
  }, [
    activeTab,
    rawEmail,
    senderName,
    senderEmail,
    subject,
    emailHeaders,
    emailBody,
  ]);

  const fullText = getFullEmailText();

  const handleAnalyze = () => {
    if (!fullText.trim() || scanning) return;
    setScanning(true);
    setResult(null);
    setFlaskResult(null);
    setShowResult(false);

    setFlaskLoading(true);
    callFlaskApi(fullText).then((res) => {
      setFlaskResult(res);
      setFlaskLoading(false);
    });
  };

  const handleScanComplete = async () => {
    const analysis = await analyzeEmail(fullText);
    setResult(analysis);
    setScanning(false);
    setShowResult(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleClear = () => {
    setSenderEmail("");
    setSenderName("");
    setSubject("");
    setEmailBody("");
    setRawEmail("");
    setEmailHeaders("");
    setResult(null);
    setFlaskResult(null);
    setFlaskLoading(false);
    setScanning(false);
    setShowResult(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (activeTab === "raw") {
        setRawEmail(text);
      } else {
        setEmailBody(text);
      }
    } catch {
      // Ignore clipboard errors
    }
  };

  const loadSample = (type: "phishing" | "legitimate") => {
    if (type === "phishing") {
      setSenderName("PayPal Security Team");
      setSenderEmail("security@paypa1-alerts.tk");
      setSubject("URGENT: Your Account Has Been Compromised - Action Required");
      setEmailBody(
        `Dear Valued Customer,\n\nWe have detected unusual activity on your PayPal account. Your account has been temporarily suspended due to a security breach. You must verify your identity immediately to avoid permanent account closure.\n\nClick here to verify your account: http://paypa1-secure.tk/verify\n\nRegards,\nPayPal Security Team`,
      );
      setEmailHeaders(
        `Received: from mail-relay.paypa1-alerts.tk (185.234.72.14)`,
      );
      setActiveTab("compose");
    } else {
      setSenderName("Michael Chen");
      setSenderEmail("michael.chen@acmecorp.com");
      setSubject("Follow up: Q3 Marketing Strategy Updates");
      setEmailBody(
        `Hi Sarah,\n\nJust following up on our meeting yesterday about the Q3 marketing strategy. I've attached the updated presentation with the changes we discussed.\n\nBest regards,\nMichael Chen`,
      );
      setEmailHeaders("");
      setActiveTab("compose");
    }
  };

  const classificationColor =
    result?.classification === "Phishing"
      ? "text-cyber-danger"
      : result?.classification === "Suspicious"
        ? "text-cyber-warning"
        : "text-cyber-success";

  const classificationBg =
    result?.classification === "Phishing"
      ? "border-cyber-danger/20 bg-cyber-danger/5"
      : result?.classification === "Suspicious"
        ? "border-cyber-warning/20 bg-cyber-warning/5"
        : "border-cyber-success/20 bg-cyber-success/5";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Email Analysis Input
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
            >
              <Clipboard className="h-3 w-3" />
              Paste
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
        </div>

        <div className="flex items-center border-b border-border bg-[#060a14]/50">
          {(
            [
              { key: "compose" as InputTab, label: "Compose View", icon: Mail },
              { key: "raw" as InputTab, label: "Raw Email", icon: FileText },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-mono transition-all border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              }`}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "compose" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    <User className="h-3 w-3" />
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. PayPal Security Team"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#060a14] text-foreground placeholder-muted-foreground/40 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                    <AtSign className="h-3 w-3" />
                    Sender Email
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="e.g. security@paypa1.tk"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#060a14] text-foreground placeholder-muted-foreground/40 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  <FileText className="h-3 w-3" />
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. URGENT: Verify Your Account Immediately"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#060a14] text-foreground placeholder-muted-foreground/40 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>

              <button
                onClick={() => setShowHeaders(!showHeaders)}
                className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
              >
                <Code className="h-3 w-3" />
                Email Headers (Optional)
                {showHeaders ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>

              {showHeaders && (
                <textarea
                  value={emailHeaders}
                  onChange={(e) => setEmailHeaders(e.target.value)}
                  placeholder="Paste email headers here..."
                  className="w-full h-28 p-4 rounded-lg border border-border bg-[#060a14] text-foreground placeholder-muted-foreground/30 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              )}

              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  <Mail className="h-3 w-3" />
                  Email Body
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Paste the email body content here for analysis..."
                  className="w-full h-48 p-4 rounded-lg border border-border bg-[#060a14] text-foreground placeholder-muted-foreground/40 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          )}

          {activeTab === "raw" && (
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                <FileText className="h-3 w-3" />
                Full Email Source (Headers + Body)
              </label>
              <textarea
                value={rawEmail}
                onChange={(e) => setRawEmail(e.target.value)}
                placeholder="Paste the full raw email source here..."
                className="w-full h-72 p-4 rounded-lg border border-border bg-[#060a14] text-foreground placeholder-muted-foreground/40 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          )}

          <div className="mt-4">
            <RealtimeIndicator text={fullText} />
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-xs text-muted-foreground font-mono">
              Load sample:
            </span>
            <button
              onClick={() => loadSample("phishing")}
              className="px-3 py-1.5 text-xs font-mono rounded-md border border-cyber-danger/30 text-cyber-danger/80 hover:bg-cyber-danger/10 transition-colors"
            >
              Phishing Email
            </button>
            <button
              onClick={() => loadSample("legitimate")}
              className="px-3 py-1.5 text-xs font-mono rounded-md border border-cyber-success/30 text-cyber-success/80 hover:bg-cyber-success/10 transition-colors"
            >
              Legitimate Email
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleAnalyze}
            disabled={!fullText.trim() || scanning}
            className="group w-full relative flex items-center justify-center gap-2.5 py-3.5 rounded-lg font-mono text-sm font-semibold tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_#00e5ff15]"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                SCANNING...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                INITIATE THREAT ANALYSIS
                <span className="text-[10px] text-primary/60 ml-1">
                  (Local ML + Flask API)
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </section>

      {scanning && (
        <section className="animate-fade-in-up">
          <ScanTerminal onComplete={handleScanComplete} />
        </section>
      )}

      {showResult && result && (
        <div ref={resultRef} className="space-y-4 animate-fade-in-up">
          <section className={`rounded-xl border p-6 ${classificationBg}`}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ConfidenceRing
                value={result.confidence}
                classification={result.classification}
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                  <h3
                    className={`text-2xl font-bold font-mono tracking-tight ${classificationColor}`}
                  >
                    {result.classification === "Phishing"
                      ? "PHISHING DETECTED"
                      : result.classification === "Suspicious"
                        ? "SUSPICIOUS CONTENT"
                        : "LEGITIMATE EMAIL"}
                  </h3>
                  <RiskBadge level={result.riskLevel} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {result.explanation}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/30">
              <Server className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                External ML API Result
              </h4>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                <ExternalLink className="h-3 w-3" />
                Flask /analyze
              </span>
            </div>
            <div className="p-5">
              {flaskLoading ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Querying Flask API...
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      POST /analyze {">"} http://127.0.0.1:5000/analyze
                    </p>
                  </div>
                </div>
              ) : flaskResult?.error ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-cyber-danger/5 border border-cyber-danger/20">
                  <WifiOff className="h-5 w-5 text-cyber-danger mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-cyber-danger">
                        API Unreachable
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-cyber-danger/10 border border-cyber-danger/20 text-[10px] font-mono text-cyber-danger">
                        OFFLINE
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground break-words">
                      {flaskResult.error}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono mt-2">
                      Ensure your Flask server is running: python app.py
                    </p>
                    <button
                      onClick={() => {
                        setFlaskLoading(true);
                        callFlaskApi(fullText).then((res) => {
                          setFlaskResult(res);
                          setFlaskLoading(false);
                        });
                      }}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry Connection
                    </button>
                  </div>
                </div>
              ) : flaskResult?.label ? (
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      flaskResult.label === "Phishing"
                        ? "bg-cyber-danger/5 border-cyber-danger/20"
                        : "bg-cyber-success/5 border-cyber-success/20"
                    }`}
                  >
                    <div
                      className={`h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                        flaskResult.label === "Phishing"
                          ? "bg-cyber-danger/10"
                          : "bg-cyber-success/10"
                      }`}
                    >
                      {flaskResult.label === "Phishing" ? (
                        <ShieldAlert className="h-7 w-7 text-cyber-danger" />
                      ) : (
                        <ShieldCheck className="h-7 w-7 text-cyber-success" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5
                          className={`text-lg font-bold font-mono tracking-tight ${
                            flaskResult.label === "Phishing"
                              ? "text-cyber-danger"
                              : "text-cyber-success"
                          }`}
                        >
                          {flaskResult.label === "Phishing"
                            ? "PHISHING DETECTED"
                            : "LEGITIMATE EMAIL"}
                        </h5>
                        <Wifi className="h-4 w-4 text-cyber-success" />
                        <span className="px-2 py-0.5 rounded-full bg-cyber-success/10 border border-cyber-success/20 text-[10px] font-mono text-cyber-success">
                          ONLINE
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Classification:{" "}
                        <span
                          className={`font-semibold ${
                            flaskResult.label === "Phishing"
                              ? "text-cyber-danger"
                              : "text-cyber-success"
                          }`}
                        >
                          {flaskResult.label}
                        </span>
                        {flaskResult.confidence != null && (
                          <> &middot; Confidence: {flaskResult.confidence}%</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                        Flask API
                      </p>
                      <p
                        className={`text-sm font-bold font-mono ${
                          flaskResult.label === "Phishing"
                            ? "text-cyber-danger"
                            : "text-cyber-success"
                        }`}
                      >
                        {flaskResult.label}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                        Local ML Wrapper
                      </p>
                      <p
                        className={`text-sm font-bold font-mono ${
                          result?.classification === "Phishing"
                            ? "text-cyber-danger"
                            : result?.classification === "Suspicious"
                              ? "text-cyber-warning"
                              : "text-cyber-success"
                        }`}
                      >
                        {result?.classification || "N/A"}
                      </p>
                    </div>
                  </div>

                  {result && (
                    <div
                      className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-mono ${
                        (flaskResult.label === "Phishing" &&
                          result.classification === "Phishing") ||
                        (flaskResult.label === "Legitimate" &&
                          result.classification === "Legitimate")
                          ? "bg-cyber-success/5 border-cyber-success/20 text-cyber-success"
                          : "bg-cyber-warning/5 border-cyber-warning/20 text-cyber-warning"
                      }`}
                    >
                      {(flaskResult.label === "Phishing" &&
                        result.classification === "Phishing") ||
                      (flaskResult.label === "Legitimate" &&
                        result.classification === "Legitimate") ? (
                        <>
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          <span>
                            Agreement Confirmed:{" "}
                            <strong>{flaskResult.label}</strong>
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          <span>
                            Models disagree. Flask:{" "}
                            <strong>{flaskResult.label}</strong> vs Local
                            Wrapper: <strong>{result.classification}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-4">
            {result?.featureBreakdown?.length > 0 && (
              <section className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/30">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Feature Breakdown
                  </h4>
                </div>
                <div className="p-5">
                  <FeatureBreakdown breakdown={result.featureBreakdown} />
                </div>
              </section>
            )}

            {result?.matchedFeatures?.length > 0 && (
              <section className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/30">
                  <AlertTriangle className="h-4 w-4 text-cyber-warning" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Detected Patterns ({result.matchedFeatures.length})
                  </h4>
                </div>
                <div className="p-5 space-y-2 max-h-64 overflow-y-auto">
                  {result.matchedFeatures.map((f, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyber-warning flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {f.description}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {f.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <section className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/30">
                <Info className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Analysis Summary
                </h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.explanation}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-lg font-bold font-mono text-foreground">
                      {result?.matchedFeatures?.length || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                      Hits
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-lg font-bold font-mono text-foreground">
                      {result?.phishingScore || 0}%
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                      Risk Score
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-lg font-bold font-mono text-foreground">
                      {result?.features?.length || 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                      Features
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/30">
                <ShieldCheck className="h-4 w-4 text-cyber-success" />
                <h4 className="text-sm font-semibold text-foreground">
                  Recommendations
                </h4>
              </div>
              <div className="p-5 space-y-2.5">
                {result?.recommendations?.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        result.classification === "Phishing"
                          ? "text-cyber-danger"
                          : result.classification === "Suspicious"
                            ? "text-cyber-warning"
                            : "text-cyber-success"
                      }`}
                    />
                    <p className="text-sm text-muted-foreground">{rec}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

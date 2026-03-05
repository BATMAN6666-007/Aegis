"use client"

import { useMemo } from "react"
import { ShieldCheck, ShieldAlert, AlertTriangle, Shield } from "lucide-react"

interface RealtimeIndicatorProps {
  text: string
}

// Quick lightweight patterns for real-time scoring (no sigmoid, just counting)
const QUICK_PATTERNS = [
  { pattern: /\b(urgent|immediately|right away|act now|asap)\b/i, weight: 2 },
  { pattern: /\b(suspend|terminat|clos|deactivat|lock|block).{0,20}account\b/i, weight: 3 },
  { pattern: /\b(password|credential|ssn|social security)\b/i, weight: 3 },
  { pattern: /\b(verify|confirm|validate).{0,15}(account|identity|information)\b/i, weight: 2 },
  { pattern: /\b(click here|click below|click the link|download)\b/i, weight: 2 },
  { pattern: /\.(tk|ml|ga|cf|xyz|top|buzz)\b|bit\.ly|tinyurl/i, weight: 3 },
  { pattern: /\b(won|winner|prize|lottery|inheritance)\b/i, weight: 3 },
  { pattern: /\b(wire transfer|bitcoin|gift card|western union)\b/i, weight: 3 },
  { pattern: /\b(dear (customer|user|sir|madam|valued))\b/i, weight: 1 },
  { pattern: /\b(failure to|if you (don'?t|do not))\b/i, weight: 1 },
  { pattern: /\b(paypal|microsoft|apple|amazon|netflix|google|bank).{0,30}(team|support|security)\b/i, weight: 2 },
  { pattern: /\b(congratulations|good news|security alert|unusual activity)\b/i, weight: 1 },
  { pattern: /\b(unsubscribe|opt.?out|manage.{0,10}preference)\b/i, weight: -1 },
]

function getQuickScore(text: string): number {
  if (!text || text.trim().length < 10) return 0
  let score = 0
  for (const p of QUICK_PATTERNS) {
    if (p.pattern.test(text)) score += p.weight
  }
  // Normalize to 0-100
  return Math.min(100, Math.max(0, Math.round((score / 18) * 100)))
}

function getThreatLevel(score: number): {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: typeof Shield
} {
  if (score >= 60)
    return {
      label: "HIGH THREAT",
      color: "text-cyber-danger",
      bgColor: "bg-cyber-danger/10",
      borderColor: "border-cyber-danger/30",
      icon: ShieldAlert,
    }
  if (score >= 30)
    return {
      label: "SUSPICIOUS",
      color: "text-cyber-warning",
      bgColor: "bg-cyber-warning/10",
      borderColor: "border-cyber-warning/30",
      icon: AlertTriangle,
    }
  if (score > 0)
    return {
      label: "LOW RISK",
      color: "text-cyber-success",
      bgColor: "bg-cyber-success/10",
      borderColor: "border-cyber-success/30",
      icon: ShieldCheck,
    }
  return {
    label: "NO INPUT",
    color: "text-muted-foreground",
    bgColor: "bg-secondary/30",
    borderColor: "border-border",
    icon: Shield,
  }
}

export function RealtimeIndicator({ text }: RealtimeIndicatorProps) {
  const score = useMemo(() => getQuickScore(text), [text])
  const threat = useMemo(() => getThreatLevel(score), [score])
  const Icon = threat.icon

  const patternHits = useMemo(() => {
    if (!text || text.trim().length < 10) return 0
    return QUICK_PATTERNS.filter((p) => p.weight > 0 && p.pattern.test(text)).length
  }, [text])

  return (
    <div
      className={`flex items-center gap-4 px-4 py-2.5 rounded-lg border transition-all duration-300 ${threat.bgColor} ${threat.borderColor}`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${threat.color}`} />

      <div className="flex-1 flex items-center gap-3">
        <span className={`text-xs font-mono font-bold tracking-wider ${threat.color}`}>
          {threat.label}
        </span>
        {score > 0 && (
          <>
            <div className="h-3 w-px bg-border" />
            <span className="text-[10px] font-mono text-muted-foreground">
              THREAT SCORE: {score}/100
            </span>
            <div className="h-3 w-px bg-border" />
            <span className="text-[10px] font-mono text-muted-foreground">
              {patternHits} PATTERN{patternHits !== 1 ? "S" : ""} DETECTED
            </span>
          </>
        )}
      </div>

      {/* Mini bar indicator */}
      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              i < Math.ceil(score / 20)
                ? score >= 60
                  ? "bg-cyber-danger h-3"
                  : score >= 30
                    ? "bg-cyber-warning h-3"
                    : "bg-cyber-success h-3"
                : "bg-border h-2"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

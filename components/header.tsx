"use client"

import { Shield, Activity } from "lucide-react"
import { useEffect, useState } from "react"

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <div className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground font-mono">
              PhishGuard<span className="text-primary">AI</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Threat Intelligence Platform
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Activity className="h-3 w-3 text-cyber-success" />
            <span>System Operational</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-xs font-mono text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-cyber-success animate-pulse" />
            ML Engine Active
          </div>
        </div>
      </div>
    </header>
  )
}

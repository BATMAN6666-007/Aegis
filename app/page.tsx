"use client";

import { CyberBackground } from "@/components/cyber-background";
import { Header } from "@/components/header";
import { StatsBar } from "@/components/stats-bar";
import { PhishingDetector } from "@/components/phishing-detector";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <CyberBackground />

      <div className="relative z-10">
        <Header />

        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          {/* Hero Section */}
          <section className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-mono text-primary mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              ML-Powered Threat Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight text-balance">
              AI Phishing Email <span className="text-primary">Detector</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Advanced machine learning classification engine with 24+ feature
              extraction and real-time threat scoring. Analyze suspicious emails
              with enterprise-grade threat intelligence.
            </p>
          </section>

          {/* Stats Bar */}
          <StatsBar />

          {/* Main Detector */}
          <div className="mt-8">
            <PhishingDetector />
          </div>

          {/* Footer */}
          <footer className="mt-16 pb-8 text-center border-t border-border pt-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono font-bold text-foreground">
                PhishGuard<span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Enterprise Threat Intelligence Platform
            </p>
            <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
              Classification model: WFE v2.4 &middot; 24+ features &middot;
              Sigmoid normalization &middot; Real-time analysis
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

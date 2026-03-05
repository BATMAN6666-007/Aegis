"use client";

import { ShieldCheck, Zap, Target, Database, MapPin } from "lucide-react";

const stats = [
  {
    icon: ShieldCheck,
    label: "Detection Rate",
    value: "96.8%",
    color: "text-cyber-success",
  },

  {
    icon: Database,
    label: "Model Accuracy",
    value: ">80%",
    color: "text-primary",
  },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative flex items-center gap-3 rounded-lg border border-border bg-card/60 backdrop-blur-sm px-4 py-3 transition-all hover:border-primary/30 hover:bg-secondary/50"
        >
          <div className="flex-shrink-0">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-lg font-bold text-foreground font-mono">
              {stat.value}
            </p>
          </div>
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #00e5ff05 0%, transparent 50%)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

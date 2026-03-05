"use client"

import { useEffect, useRef } from "react"

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Matrix-style falling characters
    const columns = Math.floor(canvas.width / 20)
    const drops: number[] = Array(columns).fill(1)
    const chars = "01ABCDEFabcdef!@#$%^&*<>{}[]"

    const draw = () => {
      ctx.fillStyle = "rgba(10, 14, 26, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#00e5ff08"
      ctx.font = "14px monospace"

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(char, i * 20, drops[i] * 20)

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#00e5ff 1px, transparent 1px),
            linear-gradient(90deg, #00e5ff 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Scan line */}
      <div className="absolute inset-x-0 h-px bg-[#00e5ff]/20 animate-scan-line" />
      {/* Radial glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, #00e5ff15 0%, transparent 70%)",
        }}
      />
    </div>
  )
}

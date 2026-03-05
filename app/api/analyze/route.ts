import { NextResponse } from "next/server"

const FLASK_API_URL =
  process.env.FLASK_API_URL || "http://127.0.0.1:5000/analyze"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email_content } = body

    if (!email_content || typeof email_content !== "string") {
      return NextResponse.json(
        { error: "email_content is required and must be a string" },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(FLASK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_content }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      return NextResponse.json(
        {
          error: `Flask API returned ${response.status}`,
          detail: errorText,
          label: null,
        },
        { status: 502 }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      label: result.label || null,
      confidence: result.confidence ?? null,
      details: result.details ?? null,
      raw: result,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred"
    const isTimeout = message.includes("abort")
    const isConnectionRefused =
      message.includes("ECONNREFUSED") || message.includes("fetch failed")

    return NextResponse.json(
      {
        error: isTimeout
          ? "Flask API request timed out (15s)"
          : isConnectionRefused
            ? "Flask API is not reachable. Ensure your Flask server is running at " +
              FLASK_API_URL
            : `Flask API error: ${message}`,
        label: null,
      },
      { status: 503 }
    )
  }
}

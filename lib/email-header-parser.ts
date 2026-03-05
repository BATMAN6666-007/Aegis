/**
 * Email Header Parser & IP Geolocation
 *
 * Parses email headers to extract routing information, originating IPs,
 * and performs geolocation lookups to trace where the email was sent from.
 */

export interface EmailHop {
  from: string
  by: string
  ip: string | null
  timestamp: string | null
  protocol: string | null
}

export interface GeoLocation {
  ip: string
  city: string
  region: string
  country: string
  countryCode: string
  lat: number
  lon: number
  isp: string
  org: string
  timezone: string
}

export interface HeaderAnalysis {
  from: string
  to: string
  subject: string
  date: string
  messageId: string
  returnPath: string
  replyTo: string
  receivedHops: EmailHop[]
  spf: string
  dkim: string
  dmarc: string
  contentType: string
  xMailer: string
  originatingIPs: string[]
  suspiciousHeaders: string[]
}

/**
 * Extract IP addresses from email header text
 */
export function extractIPs(headerText: string): string[] {
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\b/g
  const allIPs = headerText.match(ipRegex) || []

  // Filter out private/reserved IPs
  const publicIPs = allIPs.filter((ip) => {
    const parts = ip.split(".").map(Number)
    if (parts[0] === 10) return false
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false
    if (parts[0] === 192 && parts[1] === 168) return false
    if (parts[0] === 127) return false
    if (parts[0] === 0) return false
    if (parts[0] === 255) return false
    return true
  })

  return [...new Set(publicIPs)]
}

/**
 * Parse Received headers to extract mail routing hops
 */
export function parseReceivedHeaders(headerText: string): EmailHop[] {
  const receivedLines = headerText.match(/Received:\s*(.+?)(?=Received:|$)/gis) || []

  return receivedLines.map((line) => {
    const fromMatch = line.match(/from\s+([^\s(]+)/i)
    const byMatch = line.match(/by\s+([^\s(]+)/i)
    const ipMatch = line.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/)
    const dateMatch = line.match(/;\s*(.+)$/m)
    const protoMatch = line.match(/with\s+(ESMTP[A-Z]*|SMTP[A-Z]*|HTTP[A-Z]*)/i)

    return {
      from: fromMatch?.[1] || "unknown",
      by: byMatch?.[1] || "unknown",
      ip: ipMatch?.[1] || null,
      timestamp: dateMatch?.[1]?.trim() || null,
      protocol: protoMatch?.[1] || null,
    }
  })
}

/**
 * Parse a full email header block
 */
export function parseEmailHeaders(headerText: string): HeaderAnalysis {
  const getHeader = (name: string): string => {
    const regex = new RegExp(`^${name}:\\s*(.+?)$`, "im")
    return headerText.match(regex)?.[1]?.trim() || ""
  }

  const receivedHops = parseReceivedHeaders(headerText)
  const originatingIPs = extractIPs(headerText)

  // Check for suspicious header indicators
  const suspiciousHeaders: string[] = []

  const returnPath = getHeader("Return-Path")
  const from = getHeader("From")

  // Return-Path mismatch
  if (returnPath && from) {
    const rpDomain = returnPath.match(/@([^\s>]+)/)?.[1]?.toLowerCase()
    const fromDomain = from.match(/@([^\s>]+)/)?.[1]?.toLowerCase()
    if (rpDomain && fromDomain && rpDomain !== fromDomain) {
      suspiciousHeaders.push(`Return-Path domain (${rpDomain}) does not match From domain (${fromDomain})`)
    }
  }

  // Reply-To mismatch
  const replyTo = getHeader("Reply-To")
  if (replyTo && from) {
    const rtDomain = replyTo.match(/@([^\s>]+)/)?.[1]?.toLowerCase()
    const fromDomain = from.match(/@([^\s>]+)/)?.[1]?.toLowerCase()
    if (rtDomain && fromDomain && rtDomain !== fromDomain) {
      suspiciousHeaders.push(`Reply-To domain (${rtDomain}) does not match From domain (${fromDomain})`)
    }
  }

  // SPF/DKIM/DMARC failures
  const authResults = getHeader("Authentication-Results")
  if (authResults) {
    if (/spf=fail/i.test(authResults)) suspiciousHeaders.push("SPF authentication failed")
    if (/dkim=fail/i.test(authResults)) suspiciousHeaders.push("DKIM authentication failed")
    if (/dmarc=fail/i.test(authResults)) suspiciousHeaders.push("DMARC authentication failed")
  }

  // X-Mailer suspicious
  const xMailer = getHeader("X-Mailer")
  if (xMailer && /php|python|script/i.test(xMailer)) {
    suspiciousHeaders.push(`Suspicious X-Mailer: ${xMailer}`)
  }

  // Too many hops
  if (receivedHops.length > 8) {
    suspiciousHeaders.push(`Unusual number of mail hops: ${receivedHops.length}`)
  }

  return {
    from,
    to: getHeader("To"),
    subject: getHeader("Subject"),
    date: getHeader("Date"),
    messageId: getHeader("Message-ID") || getHeader("Message-Id"),
    returnPath,
    replyTo,
    receivedHops,
    spf: authResults?.match(/spf=(\w+)/i)?.[1] || "unknown",
    dkim: authResults?.match(/dkim=(\w+)/i)?.[1] || "unknown",
    dmarc: authResults?.match(/dmarc=(\w+)/i)?.[1] || "unknown",
    contentType: getHeader("Content-Type"),
    xMailer,
    originatingIPs,
    suspiciousHeaders,
  }
}

/**
 * Fetch geolocation data for an IP address using ip-api.com (free, no key required)
 */
export async function geolocateIP(ip: string): Promise<GeoLocation | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,query`)
    if (!res.ok) return null

    const data = await res.json()
    if (data.status === "fail") return null

    return {
      ip: data.query,
      city: data.city || "Unknown",
      region: data.regionName || "Unknown",
      country: data.country || "Unknown",
      countryCode: data.countryCode || "??",
      lat: data.lat || 0,
      lon: data.lon || 0,
      isp: data.isp || "Unknown",
      org: data.org || "Unknown",
      timezone: data.timezone || "Unknown",
    }
  } catch {
    return null
  }
}

/**
 * Simulate geolocation for demo purposes when API is unavailable
 * Uses deterministic hashing so same IP always gives same location
 */
export function simulateGeolocation(ip: string): GeoLocation {
  const hash = ip.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const locations = [
    { city: "Moscow", region: "Moscow", country: "Russia", countryCode: "RU", lat: 55.7558, lon: 37.6173, timezone: "Europe/Moscow", isp: "Rostelecom" },
    { city: "Lagos", region: "Lagos", country: "Nigeria", countryCode: "NG", lat: 6.5244, lon: 3.3792, timezone: "Africa/Lagos", isp: "MainOne Cable" },
    { city: "Beijing", region: "Beijing", country: "China", countryCode: "CN", lat: 39.9042, lon: 116.4074, timezone: "Asia/Shanghai", isp: "China Telecom" },
    { city: "Bucharest", region: "Bucharest", country: "Romania", countryCode: "RO", lat: 44.4268, lon: 26.1025, timezone: "Europe/Bucharest", isp: "RCS & RDS" },
    { city: "Sao Paulo", region: "Sao Paulo", country: "Brazil", countryCode: "BR", lat: -23.5505, lon: -46.6333, timezone: "America/Sao_Paulo", isp: "Vivo" },
    { city: "Hanoi", region: "Ha Noi", country: "Vietnam", countryCode: "VN", lat: 21.0278, lon: 105.8342, timezone: "Asia/Ho_Chi_Minh", isp: "VNPT" },
    { city: "Mumbai", region: "Maharashtra", country: "India", countryCode: "IN", lat: 19.076, lon: 72.8777, timezone: "Asia/Kolkata", isp: "BSNL" },
    { city: "Kiev", region: "Kyiv", country: "Ukraine", countryCode: "UA", lat: 50.4501, lon: 30.5234, timezone: "Europe/Kiev", isp: "Ukrtelecom" },
  ]

  const loc = locations[hash % locations.length]

  return {
    ip,
    city: loc.city,
    region: loc.region,
    country: loc.country,
    countryCode: loc.countryCode,
    lat: loc.lat + (hash % 100) * 0.01,
    lon: loc.lon + (hash % 100) * 0.01,
    isp: loc.isp,
    org: loc.isp,
    timezone: loc.timezone,
  }
}

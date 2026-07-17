export async function onRequestGet(context) {
  context.waitUntil(logVisit(context.request, context.env));
  return context.next();
}

async function logVisit(request, env) {
  try {
    const cf = request.cf ?? {};

    // Filter high-confidence bots; undefined score (no Bot Management sub) passes through
    const botScore = cf.botManagement?.score ?? null;
    if (botScore !== null && botScore < 30) return;

    const ip     = request.headers.get('CF-Connecting-IP') ?? '';
    const ipHash = ip ? await sha256(ip) : null;

    const lat = cf.latitude  != null ? parseFloat(cf.latitude)  : null;
    const lon = cf.longitude != null ? parseFloat(cf.longitude) : null;

    const ua         = request.headers.get('User-Agent') ?? null;
    const referrer   = request.headers.get('Referer')    ?? null;
    const deviceType = detectDevice(ua);

    await env.DB
      .prepare(
        `INSERT INTO visitor_logs
           (visited_at, ip_hash, country, region, city, postal_code,
            latitude, longitude, referrer, user_agent, device_type, bot_score, is_bot)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
      )
      .bind(
        new Date().toISOString(),
        ipHash,
        cf.country    ?? null,
        cf.region     ?? null,
        cf.city       ?? null,
        cf.postalCode ?? null,
        lat,
        lon,
        referrer,
        ua,
        deviceType,
        botScore,
      )
      .run();
  } catch (err) {
    console.error('[mrbin] visitor log failed:', err);
  }
}

async function sha256(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function detectDevice(ua) {
  if (!ua) return 'Unknown';
  return /Mobile|Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua) ? 'Mobile' : 'Desktop';
}

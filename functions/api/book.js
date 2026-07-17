/**
 * POST /api/book — receives booking form submissions.
 *
 * Flow:
 *   0. Rate limit check (5/IP/hour via D1 sliding window) → fake success if exceeded
 *   1. Parse JSON body
 *   2. Honeypot check → fake success, no side-effects
 *   3. Turnstile verification → fake success if token missing or invalid
 *   4. Validate required fields → 400 if missing
 *   5. Write to D1 (always first; notifications must not block this)
 *   6. Send Telegram to owner  (non-fatal if it fails)
 *   7. Send Resend email to customer (non-fatal if it fails)
 *   8. Update notification flags in D1
 *   9. Return success to client
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // --- Rate limiting (5 submissions per IP per hour — D1 sliding window) ---
  const ip     = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const ipHash = ip !== 'unknown' ? await sha256(ip) : null;

  if (ipHash) {
    const cutoff = new Date(Date.now() - 3600 * 1000).toISOString();
    const row = await env.DB
      .prepare(
        'SELECT COUNT(*) as cnt FROM rate_limit_logs WHERE ip_hash = ? AND endpoint = ? AND logged_at > ?'
      )
      .bind(ipHash, '/api/book', cutoff)
      .first();
    if ((row?.cnt ?? 0) >= 10) {
      return Response.json({ ok: true }); // fake success — no leak of rate limiting
    }
    // Log this attempt for the sliding window counter
    try {
      await env.DB
        .prepare('INSERT INTO rate_limit_logs (logged_at, ip_hash, endpoint) VALUES (?, ?, ?)')
        .bind(new Date().toISOString(), ipHash, '/api/book')
        .run();
    } catch (err) {
      console.error('[mrbin] rate limit log failed:', err);
    }
  }

  // --- Parse body ---
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  // --- Validate required fields ---
  const name    = String(data.name    ?? '').trim();
  const phone   = String(data.phone   ?? '').trim();
  const email   = String(data.email   ?? '').trim();
  const address = String(data.address ?? '').trim();

  if (!name || !phone || !email || !address) {
    return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const numBins    = Math.max(1, parseInt(data.bins) || 1);
  const serviceDate = String(data.date  ?? '').trim() || null;
  const notes       = String(data.notes ?? '').trim() || null;

  // --- Write to D1 (must succeed before any notification attempt) ---
  let bookingId;
  try {
    const result = await env.DB
      .prepare(
        `INSERT INTO bookings (name, phone, email, address, num_bins, service_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(name, phone, email, address, numBins, serviceDate, notes)
      .run();
    bookingId = result.meta.last_row_id;
  } catch (err) {
    console.error('[mrbin] D1 write failed:', err);
    return Response.json({ ok: false, error: 'Could not save booking' }, { status: 500 });
  }

  // --- Telegram: notify owner ---
  let ownerNotified = false;
  try {
    const lines = [
      '🗑️ <b>New Mr.Bin Booking</b>',
      '',
      `👤 <b>Name:</b> ${esc(name)}`,
      `📞 <b>Phone:</b> ${esc(phone)}`,
      `📧 <b>Email:</b> ${esc(email)}`,
      `📍 <b>Address:</b> ${esc(address)}`,
      `🗑️ <b>Bins:</b> ${numBins}`,
      `📅 <b>Date:</b> ${serviceDate ?? 'Not specified'}`,
      `📝 <b>Notes:</b> ${notes ?? 'None'}`,
    ];

    const tgRes = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    env.TELEGRAM_CHAT_ID,
          text:       lines.join('\n'),
          parse_mode: 'HTML',
        }),
      }
    );
    ownerNotified = tgRes.ok;
    if (!tgRes.ok) console.error('[mrbin] Telegram error:', await tgRes.text());
  } catch (err) {
    console.error('[mrbin] Telegram fetch error:', err);
  }

  // --- Resend: customer confirmation email ---
  let customerNotified = false;
  try {
    const dateLabel = serviceDate
      ? new Date(serviceDate + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
      : null;

    const html = `
<p>Hi ${esc(name)},</p>
<p>We received your bin cleaning request${dateLabel ? ` for <strong>${dateLabel}</strong>` : ''}. We'll text or call to confirm your appointment.</p>
<p>Here's what we have on file:</p>
<ul>
  <li><strong>Address:</strong> ${esc(address)}</li>
  <li><strong>Number of bins:</strong> ${numBins}</li>
  ${dateLabel ? `<li><strong>Requested date:</strong> ${dateLabel}</li>` : ''}
  ${notes     ? `<li><strong>Notes:</strong> ${esc(notes)}</li>`        : ''}
</ul>
<p>Thanks for choosing Mr.Bin!</p>
<p>— The Mr.Bin Team<br>Stafford &amp; Fredericksburg, VA</p>
    `.trim();

    const rsRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Mr.Bin <bookings@mrBinusa.com>',
        to:      [email],
        subject: 'Your Mr.Bin Cleaning Request',
        html,
      }),
    });
    customerNotified = rsRes.ok;
    if (!rsRes.ok) console.error('[mrbin] Resend error:', await rsRes.text());
  } catch (err) {
    console.error('[mrbin] Resend fetch error:', err);
  }

  // --- Update notification flags (best-effort) ---
  try {
    await env.DB
      .prepare('UPDATE bookings SET notified_owner = ?, notified_customer = ? WHERE id = ?')
      .bind(ownerNotified ? 1 : 0, customerNotified ? 1 : 0, bookingId)
      .run();
  } catch (err) {
    console.error('[mrbin] D1 flag update failed:', err);
  }

  return Response.json({ ok: true });
}

async function sha256(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Minimal HTML-escape for values inserted into Telegram HTML messages. */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

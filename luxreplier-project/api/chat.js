export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const { model, max_tokens, system, messages, bookingEmail, bookingDetails, bizName } = req.body;

    // ── Real email delivery via Resend ──────────────────────────
    if (bookingEmail && bookingDetails && process.env.RESEND_API_KEY) {
      const [custName, people, datetime, phone] = bookingDetails.split(',').map(s => s.trim());
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: 'LuxReplier <notifications@luxreplier.com>',
          to: [bookingEmail],
          subject: '🗓️ New Booking — ' + (bizName || 'Your Business'),
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E8E6E1; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #1A2744; font-size: 22px; margin: 0;">🗓️ New Booking Confirmed</h1>
                <p style="color: #8492A6; font-size: 14px; margin: 6px 0 0;">via your LuxReplier AI assistant</p>
              </div>
              <div style="background: #F0F7FF; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #8492A6; font-size: 13px; width: 120px;">👤 Customer</td><td style="padding: 8px 0; color: #1A2744; font-weight: 700; font-size: 14px;">${custName || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #8492A6; font-size: 13px;">👥 People</td><td style="padding: 8px 0; color: #1A2744; font-weight: 700; font-size: 14px;">${people || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #8492A6; font-size: 13px;">📅 Date & Time</td><td style="padding: 8px 0; color: #1A2744; font-weight: 700; font-size: 14px;">${datetime || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #8492A6; font-size: 13px;">📞 Phone</td><td style="padding: 8px 0; color: #1A2744; font-weight: 700; font-size: 14px;">${phone || 'N/A'}</td></tr>
                </table>
              </div>
              <p style="color: #8492A6; font-size: 12px; text-align: center; margin: 0;">Sent automatically by <strong>LuxReplier</strong> · luxreplier.com</p>
            </div>
          `,
        }),
      });
    }

    // ── AI response via Anthropic ───────────────────────────────
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 600,
        system: system || undefined,
        messages: messages || [],
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

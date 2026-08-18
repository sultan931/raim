export default function handler(request, response) {
  const { token = '', slug = '' } = request.query;
  const childName = getChildName(slug);
  const appUrl = `https://raim-bice.vercel.app/invite/${encodeURIComponent(token)}/${encodeURIComponent(slug)}`;
  const title = `${childName} invites you`;
  const description = `${childName} invites you to be their parent in Jey diary.`;
  const imageUrl = 'https://raim-bice.vercel.app/telegram-og-image.jpg';
  const userAgent = request.headers['user-agent'] ?? '';

  if (!isPreviewBot(userAgent)) {
    response.writeHead(302, { Location: appUrl });
    response.end();
    return;
  }

  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=300');
  response.end(`<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${escapeHtml(appUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Jey diary" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
  </head>
  <body>
    <p>${escapeHtml(description)}</p>
  </body>
</html>`);
}

function getChildName(slug) {
  const namePart = String(slug).replace(/-invites-you$/i, '').replace(/-/g, ' ').trim();
  if (!namePart) return 'Someone';

  return namePart
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isPreviewBot(userAgent) {
  return /telegrambot|whatsapp|facebookexternalhit|twitterbot|slackbot|discordbot|linkedinbot/i.test(
    userAgent,
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const sharp = require('./frontend/node_modules/sharp');
const fs = require('fs');

(async () => {
  const W = 1200;
  const H = 630;

  const logoBuf = await sharp('frontend/public/logo.png')
    .resize(380, null, { fit: 'inside' })
    .png()
    .toBuffer();

  const svg = `<svg width="${W}" height="${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0a1a"/>
        <stop offset="50%" stop-color="#1a0a1f"/>
        <stop offset="100%" stop-color="#2a0a0f"/>
      </linearGradient>
      <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#dc2626" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#dc2626" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="${W * 0.85}" cy="${H * 0.18}" r="450" fill="url(#glow1)"/>
    <circle cx="${W * 0.1}" cy="${H * 0.85}" r="350" fill="url(#glow2)"/>
    <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#dc2626"/>
  </svg>`;

  await sharp(Buffer.from(svg))
    .composite([{ input: logoBuf, gravity: 'northwest', top: 70, left: 90 }])
    .png()
    .toFile('og-step1.png');

  const textSvg = `<svg width="${W}" height="${H}">
    <text x="90" y="400" font-family="Arial Black, sans-serif" font-weight="900" font-size="92" fill="white">Your Gateway to</text>
    <text x="90" y="500" font-family="Arial Black, sans-serif" font-weight="900" font-size="92" fill="#ff4444">China.</text>
    <text x="90" y="555" font-family="Arial, sans-serif" font-weight="500" font-size="28" fill="#d1d5db">Study in China &#183; Product Sourcing &#183; Scholarships &#183; Logistics</text>
    <text x="${W - 30}" y="${H - 40}" font-family="Arial, sans-serif" font-weight="500" font-size="22" fill="#9ca3af" text-anchor="end">the86connects.com</text>
  </svg>`;

  await sharp('og-step1.png')
    .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile('frontend/public/og-image.jpg');

  fs.unlinkSync('og-step1.png');
  const stat = fs.statSync('frontend/public/og-image.jpg');
  console.log('OG image created:', Math.round(stat.size / 1024) + 'KB');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

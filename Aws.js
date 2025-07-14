const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// SVG templates bundled in /svgs in your zip
const fs = require('fs');
const path = require('path');

/**
 * Replace placeholders in the SVG string.
 */
function fillSvgPlaceholders(svgContent, replacements) {
  return svgContent.replace(/\{\{(.*?)\}\}/g, (full, key) => {
    const k = key.trim();
    return replacements[k] != null ? replacements[k] : full;
  });
}

exports.handler = async (event) => {
  try {
    // Parse JSON body (API Gateway proxy)
    const body = JSON.parse(event.body || '{}');
    const { platform, ...replacements } = body;

    if (!platform) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing "platform"' }) };
    }

    const svgPath = path.join(__dirname, 'svgs', `Pawn${platform}.svg`);
    if (!fs.existsSync(svgPath)) {
      return { statusCode: 404, body: JSON.stringify({ error: `Template for platform "${platform}" not found` }) };
    }

    const rawSvg = fs.readFileSync(svgPath, 'utf8');
    const filledSvg = fillSvgPlaceholders(rawSvg, replacements);
    const buffer = await sharp(Buffer.from(filledSvg)).jpeg({ quality: 90 }).toBuffer();

    const base64 = buffer.toString('base64');
    // Return Base64 JPEG directly; alternatively, upload to S3 and return URL.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
      isBase64Encoded: false,
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'SVG conversion failed' }) };
  }
};

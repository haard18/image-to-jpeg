const express = require('express');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cors=require('cors');
const app = express();
app.use(cors());
const PORT = 3000;
const OUTPUT_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// // Load SVG template once
// const svgPath = path.join(__dirname, `svgs/Pawn${platform}.svg`);
// const rawSvgTemplate = fs.readFileSync(svgPath, 'utf8');

// Parse JSON body
app.use(express.json());

/**
 * Replace placeholders in the SVG string.
 */
function fillSvgPlaceholders(svgContent, replacements) {
  return svgContent.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const trimmedKey = key.trim();
    if (trimmedKey in replacements) {
      return replacements[trimmedKey];
    } else {
      console.warn(`⚠️ No replacement found for placeholder: {{${trimmedKey}}}`);
      return `{{${trimmedKey}}}`; // Leave untouched
    }
  });
}
app.get('/', (req, res) => {
  res.send('Welcome to the SVG to JPEG conversion service!');
});
// Endpoint
app.post('/svg-to-jpeg', async (req, res) => {
  try {
    console.log('Received request to /svg-to-jpeg');
    console.log('Request body:', req.body);

    const { platform, ...replacements } = req.body;

    if (!platform || typeof replacements !== 'object') {
      return res.status(400).json({ error: 'Missing platform or invalid replacement object' });
    }

    const svgPath = path.join(__dirname, `svgs/Pawn${platform}.svg`);

    if (!fs.existsSync(svgPath)) {
      return res.status(404).json({ error: `SVG template not found for platform: ${platform}` });
    }

    const rawSvgTemplate = fs.readFileSync(svgPath, 'utf8');
    const filledSvg = fillSvgPlaceholders(rawSvgTemplate, replacements);

    const filename = `${uuidv4()}.jpeg`;
    const filepath = path.join(OUTPUT_DIR, filename);

    await sharp(Buffer.from(filledSvg))
      .jpeg({ quality: 90 })
      .toFile(filepath);

    const fileUrl = `https://image-to-jpeg-vl1x.onrender.com/uploads/${filename}`;
    res.json({ url: fileUrl });

  } catch (err) {
    console.error('Conversion error:', err);
    res.status(500).json({ error: 'Failed to convert SVG to JPEG' });
  }
});



// Static file serving
app.use('/uploads', express.static(OUTPUT_DIR));

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

app.listen(PORT, () => {
  const localIp = getLocalIp();
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Accessible locally at http://${localIp}:${PORT}`);
});

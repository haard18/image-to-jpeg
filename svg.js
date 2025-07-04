const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'pawn.svg');
let svgString = fs.readFileSync(svgPath, 'utf8');
/**
 * Replace placeholders in the SVG string.
 * @param {string} svgContent - Raw SVG string with placeholders.
 * @param {Object} replacements - Key-value pairs like { GPX_PRICE_BEFORE: "10.25", ... }
 * @returns {string} - Updated SVG with values inserted.
 */
export function fillSvgPlaceholders(svgContent, replacements) {
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
const replacements = {
  GPX_PRICE_BEFORE: '1.45 USDC',
  GPX_PRICE_AFTER: '2.13 USDC',
  PAWN_BUYBACK: '8,000 USDC',
  TX_HASH: '0xabc123456789def...',
};

const updatedSvg = fillSvgPlaceholders(svgString, replacements);

// Optional: save it back to disk or serve via endpoint
fs.writeFileSync(path.join(__dirname, 'output.svg'), updatedSvg);

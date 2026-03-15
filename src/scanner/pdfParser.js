const { PDFParse } = require('pdf-parse');

// Regex to extract URLs from text
const URL_REGEX = /https?:\/\/[^\s\)>\]"']+/gi;

// Patterns that indicate embedded JavaScript in PDF
const JS_PATTERNS = [
  /\/JavaScript/i,
  /\/JS\s*</i,
  /\/OpenAction/i,
  /\/AA\s*</i,
  /\/Launch/i,
  /app\.alert/i,
  /this\.exportDataObject/i,
];

/**
 * Parse a PDF buffer and extract URLs + detect embedded JS
 * @param {Buffer} buffer - PDF file buffer
 * @returns {{ urls: string[], hasEmbeddedJS: boolean, jsDetails: string[] }}
 */
async function parsePDF(buffer) {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  const text = data.text || '';

  // Extract URLs from text content
  const urls = [...new Set((text.match(URL_REGEX) || []).map(u => u.replace(/[.,;)>\]]+$/, '')))];

  // Check raw buffer for JS patterns (catches things not in text layer)
  const rawStr = buffer.toString('latin1');
  const jsDetails = [];
  for (const pattern of JS_PATTERNS) {
    if (pattern.test(rawStr)) {
      jsDetails.push(pattern.source);
    }
  }

  return {
    urls,
    hasEmbeddedJS: jsDetails.length > 0,
    jsDetails,
  };
}

module.exports = { parsePDF };

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
  let text = '';

  // Try pdf-parse v2 API first, fall back to raw text extraction
  try {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    text = data.text || '';
  } catch (err) {
    console.warn('[PDFParser] pdf-parse failed, falling back to raw extraction:', err.message);
    // Fallback: extract text from raw buffer (catches most URLs)
    text = buffer.toString('latin1');
  }

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

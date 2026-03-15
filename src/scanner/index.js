const crypto = require('crypto');
const { parsePDF } = require('./pdfParser');
const { checkURL } = require('./urlChecker');
const { getCachedResult, setCachedResult } = require('../db/cache');

/**
 * Compute SHA-256 hash of a buffer
 * @param {Buffer} buffer
 * @returns {string} hex hash
 */
function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Main scan orchestrator
 * @param {Buffer} fileBuffer - PDF file buffer
 * @param {string} fileName - original filename
 * @returns {object} scan result
 */
async function scanPDF(fileBuffer, fileName) {
  const fileHash = hashBuffer(fileBuffer);

  // Check cache first
  const cached = await getCachedResult(fileHash);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  // Parse PDF
  const { urls, hasEmbeddedJS, jsDetails } = await parsePDF(fileBuffer);

  // Check all URLs in parallel (cap at 10 to avoid rate limits)
  const urlsToCheck = urls.slice(0, 10);
  const urlResults = await Promise.all(urlsToCheck.map(checkURL));

  const maliciousURLs = urlResults.filter(r => r.malicious);
  const isSafe = !hasEmbeddedJS && maliciousURLs.length === 0;

  const result = {
    fileName,
    fileHash,
    isSafe,
    hasEmbeddedJS,
    jsDetails,
    totalURLs: urls.length,
    checkedURLs: urlResults,
    maliciousURLs,
    scannedAt: new Date().toISOString(),
    fromCache: false,
  };

  // Cache the result
  await setCachedResult(fileHash, result);

  return result;
}

module.exports = { scanPDF, hashBuffer };

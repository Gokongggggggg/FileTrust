const crypto = require('crypto');
const { parsePDF } = require('./pdfParser');
const { checkURL, scanFileVirusTotal } = require('./urlChecker');
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

  // Run PDF parse + VirusTotal file scan in parallel
  const [parseResult, vtFileScan] = await Promise.all([
    parsePDF(fileBuffer),
    scanFileVirusTotal(fileBuffer, fileName),
  ]);

  const { urls, hasEmbeddedJS, jsDetails } = parseResult;

  // Check URLs found inside PDF (cap at 10 to avoid rate limits)
  const urlsToCheck = urls.slice(0, 10);
  const urlResults = await Promise.all(urlsToCheck.map(checkURL));

  const maliciousURLs = urlResults.filter(r => r.malicious);

  // File is unsafe if: VT detects threats OR embedded JS found OR malicious URLs inside
  const vtMalicious = vtFileScan?.malicious || false;
  const vtFailed = vtFileScan === null;
  const isSafe = !vtMalicious && !vtFailed && !hasEmbeddedJS && maliciousURLs.length === 0;

  const result = {
    fileName,
    fileHash,
    isSafe,
    vtFailed,
    hasEmbeddedJS,
    jsDetails,
    totalURLs: urls.length,
    checkedURLs: urlResults,
    maliciousURLs,
    virusTotal: vtFileScan ? {
      malicious: vtFileScan.malicious,
      stats: vtFileScan.stats,
      detections: vtFileScan.detections,
      totalEngines: vtFileScan.totalEngines,
      permalink: vtFileScan.permalink,
    } : null,
    scannedAt: new Date().toISOString(),
    fromCache: false,
  };

  // Cache the result
  await setCachedResult(fileHash, result);

  return result;
}

module.exports = { scanPDF, hashBuffer };

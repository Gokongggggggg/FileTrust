const axios = require('axios');

const VT_API = 'https://www.virustotal.com/api/v3';
const GSB_API = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

/**
 * Follow redirect chain to get final URL
 * @param {string} url
 * @returns {string} final URL after redirects
 */
async function unshortenURL(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 10,
      timeout: 5000,
      validateStatus: () => true,
      headers: { 'User-Agent': 'SafeSend-Bot/1.0' },
    });
    return res.request?.res?.responseUrl || res.config?.url || url;
  } catch {
    return url;
  }
}

/**
 * Check a URL against VirusTotal API v3
 * @param {string} url
 * @returns {{ malicious: boolean, stats: object, permalink: string }}
 */
async function checkVirusTotal(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) throw new Error('VIRUSTOTAL_API_KEY not set');

  // Submit URL for analysis
  const submitRes = await axios.post(
    `${VT_API}/urls`,
    new URLSearchParams({ url }),
    { headers: { 'x-apikey': apiKey, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const analysisId = submitRes.data?.data?.id;
  if (!analysisId) return { malicious: false, stats: {}, permalink: null };

  // Poll for result (max 8 tries, 3s apart — VT can be slow)
  for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const result = await axios.get(`${VT_API}/analyses/${analysisId}`, {
      headers: { 'x-apikey': apiKey },
    });

    const status = result.data?.data?.attributes?.status;
    if (status === 'completed') {
      const stats = result.data?.data?.attributes?.stats || {};
      const results = result.data?.data?.attributes?.results || {};

      // Collect which engines flagged it
      const detections = [];
      for (const [engine, info] of Object.entries(results)) {
        if (info.category === 'malicious' || info.category === 'suspicious') {
          detections.push({ engine, category: info.category, result: info.result });
        }
      }

      return {
        malicious: (stats.malicious || 0) > 0 || (stats.suspicious || 0) > 0,
        stats,
        detections,
        totalEngines: Object.keys(results).length,
        permalink: `https://www.virustotal.com/gui/url/${analysisId.split('-')[1]}`,
      };
    }
  }

  return { malicious: false, stats: {}, detections: [], totalEngines: 0, permalink: null };
}

/**
 * Check URLs against Google Safe Browsing API
 * @param {string[]} urls
 * @returns {string[]} list of flagged URLs
 */
async function checkGoogleSafeBrowsing(urls) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey || urls.length === 0) return [];

  const body = {
    client: { clientId: 'safesend', clientVersion: '1.0' },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: urls.map(u => ({ url: u })),
    },
  };

  const res = await axios.post(`${GSB_API}?key=${apiKey}`, body);
  const matches = res.data?.matches || [];
  return matches.map(m => m.threat?.url).filter(Boolean);
}

/**
 * Check a single URL: unshorten → VirusTotal → Google Safe Browsing
 * @param {string} url
 * @returns {{ url: string, finalUrl: string, malicious: boolean, reason: string }}
 */
async function checkURL(url) {
  const finalUrl = await unshortenURL(url);
  const shortened = finalUrl !== url;

  let malicious = false;
  let reason = null;
  let vtData = null;
  let gsbFlagged = false;

  try {
    const vtResult = await checkVirusTotal(finalUrl);
    vtData = {
      stats: vtResult.stats,
      detections: vtResult.detections || [],
      totalEngines: vtResult.totalEngines || 0,
      permalink: vtResult.permalink,
    };
    if (vtResult.malicious) {
      malicious = true;
      reason = `terdeteksi oleh VirusTotal (${vtResult.stats.malicious || 0} malicious, ${vtResult.stats.suspicious || 0} suspicious)`;
    }
  } catch (e) {
    console.error('[URLChecker] VirusTotal error:', e.message);
  }

  try {
    const flagged = await checkGoogleSafeBrowsing([finalUrl]);
    if (flagged.length > 0) {
      gsbFlagged = true;
      if (!malicious) {
        malicious = true;
        reason = 'terdeteksi oleh Google Safe Browsing';
      } else {
        reason += ' + Google Safe Browsing';
      }
    }
  } catch (e) {
    console.error('[URLChecker] Google Safe Browsing error:', e.message);
  }

  return { url, finalUrl, shortened, malicious, reason, vtData, gsbFlagged };
}

module.exports = { checkURL, unshortenURL, checkVirusTotal, checkGoogleSafeBrowsing };

const axios = require('axios');
const { scanPDF } = require('../scanner');
const { formatReply } = require('./reply');

const WA_API = 'https://graph.facebook.com/v22.0';

/**
 * Download file from WhatsApp media URL
 * @param {string} mediaId
 * @returns {Buffer}
 */
async function downloadMedia(mediaId) {
  const token = process.env.WA_ACCESS_TOKEN;

  // Step 1: get download URL from media ID
  const metaRes = await axios.get(`${WA_API}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const downloadUrl = metaRes.data?.url;
  if (!downloadUrl) throw new Error('Could not get media download URL');

  // Step 2: download the actual file
  const fileRes = await axios.get(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'arraybuffer',
  });

  return Buffer.from(fileRes.data);
}

/**
 * Send a text message to a WA group/recipient
 * @param {string} to - phone number or group ID
 * @param {string} text - message body
 */
async function sendMessage(to, text) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;

  await axios.post(
    `${WA_API}/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handle an incoming WA message object
 * @param {object} message - WA message object from webhook
 * @param {string} groupId - group/sender ID to reply to
 */
async function handleMessage(message, groupId) {
  // Only handle document messages
  if (message.type !== 'document') return;

  const doc = message.document;
  const mimeType = doc.mime_type || '';
  const fileName = doc.filename || 'file.pdf';

  // Only handle PDFs
  if (mimeType !== 'application/pdf' && !fileName.toLowerCase().endsWith('.pdf')) return;

  console.log(`[Bot] PDF detected: ${fileName}, scanning...`);

  try {
    // Notify group that scan is in progress
    await sendMessage(groupId, `🔍 Sedang scan *${fileName}*... mohon tunggu.`);

    const buffer = await downloadMedia(doc.id);
    const result = await scanPDF(buffer, fileName);
    const reply = formatReply(result);

    await sendMessage(groupId, reply);
    console.log(`[Bot] Scan done for ${fileName}, safe=${result.isSafe}`);
  } catch (err) {
    console.error('[Bot] Scan failed:', err.message);
    await sendMessage(groupId, `❌ Gagal scan *${fileName}*. Coba lagi atau hubungi seller langsung.`);
  }
}

module.exports = { handleMessage, sendMessage };

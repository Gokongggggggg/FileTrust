/**
 * Format scan result into a plain-language WA message
 * @param {object} result - from scanPDF()
 * @returns {string} message to send to WA group
 */
function formatReply(result) {
  const { fileName, isSafe, hasEmbeddedJS, maliciousURLs, fromCache } = result;

  if (isSafe) {
    return `✅ *File Aman — SafeSend*\n\n📄 ${fileName}\n🔍 Tidak ditemukan script berbahaya\n🔗 Tidak ditemukan link mencurigakan\n\nBuyer bisa download file ini dengan tenang.\n— SafeSend 🔒${fromCache ? '\n_(hasil dari cache)_' : ''}`;
  }

  const issues = [];

  if (hasEmbeddedJS) {
    issues.push('⚙️ Ditemukan script otomatis (JavaScript) dalam PDF ini');
  }

  if (maliciousURLs.length > 0) {
    const linkLines = maliciousURLs.map(r => {
      const display = r.shortened ? `${r.url} → ${r.finalUrl}` : r.url;
      return `   • ${display}\n     _${r.reason}_`;
    }).join('\n');
    issues.push(`🔗 Link berbahaya ditemukan:\n${linkLines}`);
  }

  return `⚠️ *File Mencurigakan — SafeSend*\n\n📄 ${fileName}\n${issues.join('\n\n')}\n\n*Jangan download file ini.*\n— SafeSend 🔒`;
}

module.exports = { formatReply };

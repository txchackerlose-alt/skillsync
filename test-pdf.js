const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractFromPdf(buffer) {
  try {
    const result = await pdfParse(buffer);
    return result.text || '';
  } catch (err) {
    console.error(err);
    return '';
  }
}

async function test() {
  // Let's create a dummy pdf with text "React Node.js"
  // Actually I don't have a pdf, let's just see if pdf-parse works in principle.
  console.log('pdf-parse is loaded:', typeof pdfParse === 'function');
}

test();

const fs = require('fs');

function removeHeaders(filePath) {
  try {
    let data = fs.readFileSync(filePath, 'utf-8');
    const headersIndex = data.indexOf('Content-Type: text/csv');

    if (headersIndex !== -1) {
      data = data.substring(headersIndex);
      const lineBreakIndex = data.indexOf('\n');
      if (lineBreakIndex !== -1) {
        data = data.substring(lineBreakIndex + 1).trim();
        fs.writeFileSync(filePath, data);
        console.log('Headers removed successfully.');
      } else {
        console.log('Line break not found after Content-Type.');
      }
    } else {
      console.log('No headers found.');
    }
  } catch (error) {
    console.error('Error removing headers:', error);
  }
}

module.exports = { removeHeaders };

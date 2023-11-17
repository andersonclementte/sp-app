const http = require('http');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const PORT = 3000;

let csvData = [];

function escreverJSON(data) {
  const jsonData = JSON.stringify(data, null, 2);
  const filePath = path.join(__dirname, 'data', 'data.json'); // Caminho para a pasta 'data' e arquivo 'data.json'

  fs.writeFile(filePath, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Erro ao escrever arquivo JSON:', err);
      return;
    }
    console.log('Arquivo JSON gerado com sucesso!');
  });
}

function loadCSVData() {
  const filePath = './uploads/uploadedFile.csv';
  if (fs.existsSync(filePath)) {
    csvData = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        escreverJSON(csvData);
        return;
      });
  } else {
    console.log('O arquivo CSV ainda não foi enviado.');
    return;
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'POST' && req.url === '/api/files') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      body = body.split('\n').slice(4, -2).join('\n');
    });

    req.on('end', () => {
      try {
        if (!req.headers['content-type'].includes('multipart/form-data')) {
          throw new Error('No file uploaded');
        }

        fs.writeFileSync('./uploads/uploadedFile.csv', body);
        loadCSVData();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'The file was uploaded successfully.' }));
        return;
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: error.message }));
        return;
      }
    });
    
  }

  else if (req.method === 'GET' && req.url.startsWith('/api/users')) {
    const searchTerm = new URL(req.url, `http://${req.headers.host}`).searchParams.get('q');
    if (!searchTerm) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Missing search term' }));
        return;
    }

    try {
        const filteredData = csvData.filter((item) =>
            Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: filteredData }));
        return;
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: error.message }));
        return;
    }
}

else if (req.method === 'GET' && req.url === '/api/csv-data') {
  console.log('Consultando dados do arquivo CSV');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ data: csvData }));
}

else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Route not found');
}

});

loadCSVData();
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
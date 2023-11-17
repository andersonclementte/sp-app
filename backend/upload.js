// backend/server.js
const http = require('http');
const fs = require('fs');
const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/files') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        // Verifica se a requisição contém o arquivo
        if (!req.headers['content-type'].includes('multipart/form-data')) {
          throw new Error('No file uploaded');
        }

        // Salva o arquivo no servidor (substitua 'uploads' pelo diretório desejado)
        fs.writeFileSync('./uploads/uploadedFile.csv', body);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'The file was uploaded successfully.' }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Route not found');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

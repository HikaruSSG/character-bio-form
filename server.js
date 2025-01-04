const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;
const dataFilePath = path.join(__dirname, 'data.json');

// Create data.json if it doesn't exist
fs.access(dataFilePath)
  .catch(() => fs.writeFile(dataFilePath, '[]'));

const server = http.createServer(async (req, res) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log(`Responding with status: 204`);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/save-bio' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const newBio = JSON.parse(body);
        const data = await fs.readFile(dataFilePath, 'utf8');
        const existingBios = JSON.parse(data);
        existingBios.push(newBio);
        await fs.writeFile(dataFilePath, JSON.stringify(existingBios, null, 2));
        console.log(`Responding to /save-bio with status: 200, Content-Type: application/json`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        console.log(`Sending response to /save-bio: ${JSON.stringify({ message: 'Bio saved successfully' })}`);
        res.end(JSON.stringify({ message: 'Bio saved successfully' }));
      } catch (error) {
        console.error('Error saving bio:', error);
        console.log(`Responding to /save-bio with status: 500, Content-Type: application/json`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        console.log(`Sending response to /save-bio: ${JSON.stringify({ message: 'Error saving bio' })}`);
        res.end(JSON.stringify({ message: 'Error saving bio' }));
      }
    });
  } else if (req.url === '/get-bios' && req.method === 'GET') {
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      console.log(`Responding to /get-bios with status: 200, Content-Type: application/json`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      console.log(`Sending response to /get-bios: ${data}`);
      res.end(data);
    } catch (error) {
      console.error('Error reading bios:', error);
      console.log(`Responding to /get-bios with status: 500, Content-Type: application/json`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      console.log(`Sending response to /get-bios: ${JSON.stringify({ message: 'Error reading bios' })}`);
      res.end(JSON.stringify({ message: 'Error reading bios' }));
    }
  } else if (req.url === '/') {
    try {
      const html = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
      console.log(`Responding to / with status: 200, Content-Type: text/html`);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      console.log(`Sending response to /: ${html}`);
      res.end(html);
    } catch (error) {
      console.log(`Responding to / with status: 500`);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  } else {
    const filePath = path.join(__dirname, req.url);
    fs.access(filePath)
      .then(() => fs.readFile(filePath))
      .then(data => {
        const extname = path.extname(req.url);
        let contentType = 'text/plain';
        if (extname === '.html') {
          contentType = 'text/html';
        } else if (extname === '.css') {
          contentType = 'text/css';
        } else if (extname === '.js') {
          contentType = 'text/javascript';
        } else if (extname === '.json') {
          contentType = 'application/json';
        }
        console.log(`Responding to ${req.url} with status: 200, Content-Type: ${contentType}`);
        res.writeHead(200, { 'Content-Type': contentType });
        console.log(`Sending response to ${req.url}: ${data}`);
        res.end(data);
      })
      .catch(() => {
        console.log(`Responding to ${req.url} with status: 404`);
        res.writeHead(404);
        console.log(`Sending response to ${req.url}: Not Found`);
        res.end('Not Found');
      });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

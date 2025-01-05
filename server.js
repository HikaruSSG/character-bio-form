// Import the HTTP module for creating the server
const http = require('http');
// Import the fs module for file system operations, specifically using promises for asynchronous operations
const fs = require('fs').promises;
// Import the path module for working with file and directory paths
const path = require('path');

// Define the hostname for the server, defaulting to '127.0.0.1' if the environment variable is not set
const hostname = process.env.HOSTNAME || '127.0.0.1';
// Define the port for the server, defaulting to 3000 if the environment variable is not set
const port = process.env.PORT || 3000;
// Define the path to the data file where bio information will be stored
const dataFilePath = 'data.json';

// Ensure that the data.json file exists. If it doesn't, create it with an empty array.
fs.access(dataFilePath)
  .catch(() => fs.writeFile(dataFilePath, '[]'));

// Create an HTTP server that listens for requests
const server = http.createServer(async (req, res) => {
  // Set headers to allow Cross-Origin Resource Sharing (CORS) from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Set headers to allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  // Set headers to allow specific headers in the request
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
addAlignment: false

  // Handle the /save-bio endpoint for saving bio information
  if (req.url === '/save-bio' && req.method === 'POST') {
    let body = '';
    // Read the incoming data stream
    req.on('data', chunk => {
      body += chunk.toString();
    });
    // When all data is received
    req.on('end', async () => {
      try {
        // Parse the JSON data from the request body
        const newBio = JSON.parse(body);
        // Read the existing bio data from the file
        const data = await fs.readFile(dataFilePath, 'utf8');
        // Parse the existing bio data
        const existingBios = JSON.parse(data);
        // Add the new bio to the array of existing bios
        existingBios.push(newBio);
        // Write the updated bios back to the data file
        await fs.writeFile(dataFilePath, JSON.stringify(existingBios, null, 2));
        // Send a success response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Bio saved successfully' }));
      } catch (error) {
        // Handle errors during the saving process
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error saving bio' }));
      }
    });
  // Handle the /get-bios endpoint for retrieving bio information
  } else if (req.url === '/get-bios' && req.method === 'GET') {
    try {
      // Read the bio data from the file
      const data = await fs.readFile(dataFilePath, 'utf8');
      // Send the bio data as a JSON response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (error) {
      // Handle errors during the reading process
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error reading bios' }));
    }
  // Handle the root endpoint to serve the index.html file
  } else if (req.url === '/') {
    try {
      // Read the index.html file
      const html = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
      // Send the HTML content
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      // Handle errors during file reading
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  // Handle requests for other static files
  } else {
    // Construct the file path based on the requested URL
    const filePath = path.join(__dirname, req.url);
    // Check if the file exists
    fs.access(filePath)
      .then(() => fs.readFile(filePath))
      .then(data => {
        // Determine the content type based on the file extension
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
        // Send the file content with the correct content type
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      })
      .catch(() => {
        // Handle cases where the file is not found
        res.writeHead(404);
        res.end('Not Found');
      });
  }
});

// Start the server and listen on the specified hostname and port
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

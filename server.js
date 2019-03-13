const express = require('express');
const http = require('http');

const app = express();
const server = http.Server(app);

server.listen('3000', async () => {
  console.log('Server running on http://localhost:3000');
});

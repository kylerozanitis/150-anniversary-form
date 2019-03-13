const express = require('express');
const http = require('http');
const Dropbox = require('dropbox');

const app = express();
const server = http.Server(app);

require('dotenv').config();

const uploadFile = () => {
  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  const dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
  const fileInput = document.getElementById('file-upload');
  const file = fileInput.files[0];
};

server.listen('3000', async () => {
  console.log('Server running on http://localhost:3000');
});

const express = require('express');
const layout = require('express-layout');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const Dropbox = require('dropbox');

require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const middleware = [
  express.static(path.join(__dirname, '../public')),
  bodyParser.urlencoded({ extended: true })
];

app.use(middleware);
app.use('/', routes);

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, async () => {
  console.log('Server running on http://localhost:5000');
});

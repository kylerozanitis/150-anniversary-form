const express = require('express');
const layout = require('express-layout');
const http = require('http');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const helmet = require('helmet');
const path = require('path');
const routes = require('./routes');
const Dropbox = require('dropbox');

require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(helmet());

const middleware = [
  express.static(path.join(__dirname, '../public')),
  bodyParser.urlencoded({ extended: true }),
  validator(),
  cookieParser(),
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { MAXAGE: 60000 }
  }),
  flash()
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

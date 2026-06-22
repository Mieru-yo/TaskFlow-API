const express = require('express');
const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.use('/', require('./routes/health'));

module.exports = app;

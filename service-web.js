#!/usr/bin/env node

const express = require('express');
const app = express();

const PID = process.pid;
const PORT = Math.floor(process.argv[2]);

app.get('/', (req, res) => {
  console.log('GET /', Date.now());
  res.json({
    data: null,
    pid: PID
  });
});

app.get('/health', (req, res) => {
  console.log('GET /health', Date.now());
  res.send('ok');
});

app.listen(PORT, () => {
  console.log(`PID: ${PID}, PORT: ${PORT}`);
});

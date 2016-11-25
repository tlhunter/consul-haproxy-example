#!/usr/bin/env node

const express = require('express');
const app = express();

const PID = process.pid;
const PORT = Math.floor(process.argv[2]);

app.get('/', (req, res) => {
  res.json({
    data: null,
    pid: PID
  });
});

app.listen(PORT, () => {
  console.log(`PID: ${PID}, PORT: ${PORT}`);
});

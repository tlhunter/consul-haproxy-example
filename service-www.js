#!/usr/bin/env node

const express = require('express');
const consul = require('consul')();
const os = require('os');
const uuid = require('uuid');
const request = require('request');
const app = express();

const PID = process.pid;
const PORT = Math.floor(process.argv[2]);
const HOST = os.hostname();
const CONSUL_ID = `www-${HOST}:${PORT}-${uuid.v4()}`;

app.get('/', (req, res) => {
  console.log('GET /', Date.now());
  getData((err, data) => {
    if (err) {
      return res.json({
        error: err
      }).status(500);
    }

    res.json({
      data,
      web_pid: PID
    }).status(200);
  });
});

function getData(cb) {
  consul.catalog.service.nodes('data-provider', (err, nodes) => {
    if (err) return cb(err);
    let node = nodes[Math.floor(Math.random()*nodes.length)];
    let url = `http://${node.ServiceAddress}:${node.ServicePort}/`;
    console.log('URL', url);
    request(url, {json:true}, (err, res, data) => {
      if (err) return cb(err);

      cb(null, data);
    });
  });
}

/*
app.get('/health', (req, res) => {
  console.log('GET /health', Date.now());
  res.send('ok');
});
*/

app.listen(PORT, () => {
  let details = {
    name: 'www',
    address: HOST,
    port: PORT,
    id: CONSUL_ID
  };

  console.log(`PID: ${PID}, PORT: ${PORT}, ID: ${CONSUL_ID}`);

  consul.agent.service.register(details, err => {
    if (err) {
      throw new Error(err);
    }
    console.log('registered with Consul');

    process.on('SIGINT', () => {
      console.log('SIGINT. De-Registering...');
      let details = {id: CONSUL_ID};
      consul.agent.service.deregister(details, (err) => {
        console.log('de-registered.', err);
        process.exit();
      });
    });
  });
});

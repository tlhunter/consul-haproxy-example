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
const CONSUL_ID = `www-${HOST}-${PORT}-${uuid.v4()}`;

let known_data_instances = []; // Array of URLs to instances of the data service

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
  let url = known_data_instances[Math.floor(Math.random()*known_data_instances.length)];
  console.log('URL', url);
  request(url, {json:true}, (err, res, data) => {
    if (err) return cb(err);

    cb(null, data);
  });
}

app.get('/health', (req, res) => {
  console.log('GET /health', Date.now());
  res.send('ok');
});

app.listen(PORT, () => {
  let details = {
    name: 'www',
    address: HOST,
    check: {
      ttl: '10s',
      deregister_critical_service_after: '1m'
    },
    port: PORT,
    id: CONSUL_ID
  };

  console.log(`PID: ${PID}, PORT: ${PORT}, ID: ${CONSUL_ID}`);

  consul.agent.service.register(details, (err, xyz) => {
    if (err) {
      throw new Error(err);
    }
    console.log('registered with Consul');

    setInterval(() => {
      consul.agent.check.pass({id:`service:${CONSUL_ID}`}, err => {
        if (err) throw new Error(err);
        console.log('told Consul that we are healthy');
      });
    }, 5 * 1000);

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

// Keep a list of healthy services
var watcher = consul.watch({
  method: consul.health.service,
  options: {
    service:'data',
    passing:true
  }
});

watcher.on('change', data => {
  console.log('received discovery update:', data.length);
  known_data_instances = [];

  data.forEach(entry => {
    known_data_instances.push(`http://${entry.Service.Address}:${entry.Service.Port}/`);
  });
});

watcher.on('error', err => {
  console.error('watch error', err);
});

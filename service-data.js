#!/usr/bin/env node

const express = require('express');
const consul = require('consul')();
const os = require('os');
const uuid = require('uuid');
const app = express();

const PID = process.pid;
const PORT = Math.floor(process.argv[2]);
const HOST = os.hostname();
const CONSUL_ID = `data-${HOST}-${PORT}-${uuid.v4()}`;

app.get('/', (req, res) => {
  console.log('GET /', Date.now());
  res.json({
    data: Math.floor(Math.random() * 89999999 + 10000000),
    data_pid: PID
  });
});

app.get('/health', (req, res) => {
  console.log('GET /health', Date.now());
  res.send('ok');
});

app.listen(PORT, () => {
  let details = {
    name: 'data',
    address: HOST,
    check: {
      ttl: '10s',
      deregister_critical_service_after: '1m'
    },
    port: PORT,
    id: CONSUL_ID
  };

  console.log(`PID: ${PID}, PORT: ${PORT}, ID: ${CONSUL_ID}`);

  consul.agent.service.register(details, err => {
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

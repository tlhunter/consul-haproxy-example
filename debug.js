#!/usr/bin/env node

const consul = require('consul')();

function handler(nodes) {
  console.log('\n');

  nodes.forEach(entry => {
    console.log(entry.Service.ID);
    console.log(`http://${entry.Service.Address}:${entry.Service.Port}/`);
  });
}

var data_watcher = consul.watch({
  method: consul.health.service,
  options: {
    service: 'data',
    passing: true
  }
});

data_watcher.on('change', handler);

data_watcher.on('error', err => {
  console.error('watch data error', err);
});

var www_watcher = consul.watch({
  method: consul.health.service,
  options: {
    service: 'www',
    passing: true
  }
});

www_watcher.on('change', handler);

www_watcher.on('error', err => {
  console.error('watch www error', err);
});

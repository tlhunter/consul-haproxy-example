#!/usr/bin/env node

const consul = require('consul')();

function handler (err, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    console.log(nodes[i]);
  }
}

setInterval(() => {
  console.log('ITEMS:');
  consul.catalog.service.nodes('data', handler);
  consul.catalog.service.nodes('www', handler);
}, 4 * 1000);

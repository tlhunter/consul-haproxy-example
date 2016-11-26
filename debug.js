#!/usr/bin/env node

const consul = require('consul')();

function handler (err, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    console.log(nodes[i].Service.ID);
    //console.log(nodes[i]);
  }
}

setInterval(() => {
  console.log('ITEMS:');
  consul.health.service({service:'data', passing:true}, handler);
  consul.health.service({service:'www', passing:true}, handler);
}, 2 * 1000);

#!/usr/bin/env node
const parser = require('./index');

function printUsage() {
  console.log('Usage: cli.js [url]');
}

if (process.argv.length <= 2) {
  printUsage();
  process.exit(-1);
}

(async () => {
  const url = process.argv[2];
  const obj = await parser(url);
  if (!obj) {
    printUsage();
    process.exit(-1);
  }
  console.log(obj);
})();

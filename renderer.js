// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const os = require('os');

let codeBlock = document.createElement('pre');
codeBlock.innerHTML = JSON.stringify(os.networkInterfaces(), undefined, 2);
document.body.appendChild(codeBlock);
const netsh = require('./windows/netsh');
let interfaces = netsh.getNetInterfaces();

// Object array with name, IP, subnet, and family of each non-local interface
let currentConfig = netsh.getCurrentConfig();

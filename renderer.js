// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const os = require('os');

let codeBlock = document.createElement('pre');
codeBlock.innerHTML = JSON.stringify(os.networkInterfaces(), undefined, 2);
document.body.appendChild(codeBlock);

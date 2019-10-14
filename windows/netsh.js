const os = require('os');

function getNetInterfaces() {

    // Grab JSON object that lists network interfaces and properties
    let rawInterfaces = os.networkInterfaces();

    // Create array to hold interface names
    let interfacesArray = [];

    // Loop through each interface and push them to the interfaces array
    for (let key in rawInterfaces) {
        interfacesArray.push(key)
    }

    // Return the array of interfaces
    return interfacesArray;
}

// TODO get current configuration
// list adapter's current configs

// netsh int ip set address "NIC name" static 10.0.0.1 255.255.255.0 10.0.0.254

module.exports= {
    getNetInterfaces
};
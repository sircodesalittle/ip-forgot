const os = require('os');
let test_iface_name = "Wi-Fi";

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


/*
    Returns an object containing relevant information about current
    interfaces. Will not include loopback and local interfaces.
    For IPv4 interfaces:
        family ("IPv4")
        address
        subnet mask
    For IPv6 interfaces:
        family ("IPv6")
        address
        subnet mask
 */
function getCurrentConfig() {
    // Grab JSON object that lists network interfaces and properties
    let rawInterfaces = os.networkInterfaces();

    // Create array to hold current config details
    let currentIfaces = [];

    // Loop through each interface and if it's not loopback, add to the list
    for (iface in rawInterfaces) {
        for (let i = 0; i < rawInterfaces[iface].length; i++) {
            if (!(rawInterfaces[iface][i]["internal"])) {
                currentIfaces.push(getInterfaceDetails(rawInterfaces[iface][i], iface));
            }
        }
    }

    return currentIfaces;
}

function getInterfaceDetails(iface, name) {
    let obj = {
        name: name,
        family: iface["family"],
        address: iface["address"],
        subnet: iface["netmask"]
    };

    return obj;
}

// netsh int ip set address "NIC name" static 10.0.0.1 255.255.255.0 10.0.0.254
function setIP(nicName, address, mask, gateway) {
    const cmd = `netsh int ip set address "${nicName}" static ${address} ${mask} ${gateway}`;
    console.log(cmd);
    let setIpProcess = child_process.spawn(cmd);

    setIpProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    setIpProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    setIpProcess.on('error', (data) => {
        console.log(data);
    });

    setIpProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

module.exports= {
    getNetInterfaces,
    getCurrentConfig
};

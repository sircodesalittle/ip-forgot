<template>
  <div id="wrapper">
    <main>
        <div>
            <ul>
                <li v-for="(nics, adapterName, index) in networkInterfaces" v-bind:key="index">
                    {{ adapterName }}
                    <ul>
                        <li v-for="(nic, nicIndex) in nics" v-bind:key="nicIndex">
                            {{ nic.address }}
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </main>
  </div>
</template>

<script>
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
        console.log(os.networkInterfaces());

        // Create array to hold current config details
        let currentIfaces = [];
        let id = 1;

        // Loop through each interface and if it's not loopback, add to the list
        for (let iface in rawInterfaces) {
            for (let i = 0; i < rawInterfaces[iface].length; i++) {
                if (!(rawInterfaces[iface][i]["internal"])) {
                    currentIfaces.push(getInterfaceDetails(rawInterfaces[iface][i], iface, id));
                    id++;
                }
            }
        }

        return currentIfaces;
    }

    function getInterfaceDetails(iface, name, id) {
        let obj = {
            id: id,
            name: name,
            family: iface["family"],
            address: iface["address"],
            subnet: iface["netmask"]
        };

        return obj;
    }

    export default {
        name: 'network-interfaces',
        data () {
            return {
                networkInterfaces: Object.assign({}, os.networkInterfaces())
            }
        },
        mounted() {
            setInterval(() => {
                this.networkInterfaces = Object.assign({}, os.networkInterfaces())
            }, 2000)
        }
    }
</script>
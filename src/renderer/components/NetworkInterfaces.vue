<template>
    <div id="wrapper">
        <main>
            <h1>Add Address to Adapter</h1>
            <select v-model="selectedAddToAdapter">
                <option disabled value="">Please select one</option>
                <option v-for="(nics, adapterName, index) in networkInterfaces" v-bind:key="index">
                    {{ adapterName }}
                </option>
            </select>
            <h2>IPv4</h2>
            <div>
                <label for="addAddressInput">Address: </label>
                <input name="addAddressInput" id="addAddressInput" v-model="addIPv4Address" placeholder="192.168.168.133">

                <label for="addAddressSubnetInput">Subnet: </label>
                <input name="addAddressSubnetInput" id="addAddressSubnetInput" v-model="addSubnet" placeholder="255.255.255.0">
            </div>
            <button v-on:click="executeAddIPv4Address($event)">Add IPv4 Address</button>

            <h2>IPv6</h2>
            <div>
                <label for="addIPv6AddressInput">Address: </label>
                <input name="addIPv6AddressInput" id="addIPv6AddressInput" v-model="addIPv6Address" placeholder="fe80::192:168:168:99/64">
            </div>
            <button v-on:click="executeAddIPv6Address($event)">Add IPv6 Address</button>

            <h1>Current Adapter Configurations</h1>
            <div>
                <ul>
                    <li v-for="(nics, adapterName, index) in networkInterfaces" v-bind:key="index">
                        <button v-on:click="saveAdapterConfig($event, adapterName)">Save Adapter Configuration</button>
                        {{ adapterName }}
                        <ul>
                            <li v-for="(nic, nicIndex) in nics" v-bind:key="nicIndex">
                                {{ nic.address }}
                                <button v-on:click="executeRemoveAddress($event, adapterName, nic)">Remove Address</button>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>

            <h1>Saved Adapter Configurations</h1>
            <button v-on:click="applySavedAdapterConfig($event)">Apply Saved Adapter Configuration</button>
            <div>
                <ul>
                    <li v-for="(nics, adapterName, index) in savedAdapters" v-bind:key="index">
                        <button v-on:click="removeSavedAdapterConfig($event, adapterName)">Delete Saved Adapter
                            Configuration
                        </button>
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
    const EventEmitter = require('events').EventEmitter;
    import {detailedDiff} from 'deep-object-diff';

    let networkEventEmitter = new EventEmitter();
    networkEventEmitter.on('added', (event) => {
        console.log('added event', event)
    });
    networkEventEmitter.on('deleted', (event) => {
        console.log('deleted event', event)
    });
    networkEventEmitter.on('updated', (event) => {
        console.log('updated event', event)
    });

    /*
    To dump or export the TCP/IP configuration, use this command:
        netsh -c interface dump > PATH_AND_FILENAME.txt
    Use this command to import the TCP/IP configuration:
        netsh -f PATH_AND_FILENAME.txt

        netsh -c interface ip dump
        netsh -c interface ipv6 dump

        Add an address to an interface
            netsh interface ip add address name="Ethernet 34" address=192.168.168.101 mask=255.255.255.0
        IPv6 version
            netsh interface ipv6 add address interface="Ethernet 5" address=fd01::172:31:218:39/64

        Remove an address from an interface
            netsh interface ip delete address "Ethernet 34" addr=192.168.168.101
            netsh interface ipv6 delete address interface="Local Area Connection 2" address="fd7e:df1d:94d9:0:381d:a3b4:8849:b4bf"
     */
    const {exec} = require('child_process');

    const getIPVersion = (ipVersion) => {
        let ipVersionCommand = 'ip';
        if (ipVersion === 6)
            ipVersionCommand = 'ipv6';
        return ipVersionCommand;
    };

    const executeCommand = (command) => {
        console.debug('Executing command: ' + command);
        const executedCommand = exec(command, (error, stdout, stderr) => {
            if (error)
                console.log(error);
            // console.log(stdout);
            // console.log(stderr);
        });

        executedCommand.on('exit', (code) => {
            console.debug('Command process exited with exit code: ' + code);
        })
    };

    const deleteAdapterAddress = (adapterName, addr, ipVersion=4) => {
        let ipVersionCommand = getIPVersion(ipVersion);
        const command = `netsh interface ${ipVersionCommand} delete address "${adapterName}" addr=${addr}`;
        executeCommand(command);
    };

    const addAdapterIPv4Address = (adapterName, addr, subnetMask='255.255.255.0') => {
        let command = `netsh interface ip add address "${adapterName}" address=${addr} mask=${subnetMask}`;
        executeCommand(command);
    };

    const addAdapterIPv6Address = (adapterName, cidr) => {
        const command = `netsh interface ipv6 add address interface="${adapterName}" addr=${cidr}`;
        executeCommand(command);
    };

    const applyAdapterConfig = (savedAdapters) => {
        for (const adapter of Object.keys(savedAdapters)) {
            let currentAdapterConfig = os.networkInterfaces()[adapter];
            if (!currentAdapterConfig)
                throw new Error('Adapter is not available in current adapters. Looking for: ' + adapter);
            // Iterate over current adapter and remove its IP addresses
            for (const nic of currentAdapterConfig) {
                console.log(nic);
                let ipVersion = 4;
                if (nic.family === 'IPv6')
                    ipVersion = 6;
                deleteAdapterAddress(adapter, nic.address, ipVersion);
            }
            // Iterate over saved adapter and add its IP addresses
            for (const nic of savedAdapters[adapter]) {
                if (nic.family === 'IPv6')
                    addAdapterIPv6Address(adapter, nic.cidr);
                else
                    addAdapterIPv4Address(adapter, nic.address, nic.netmask);
            }
        }
    };


    let fs = require('fs');
    const SAVED_CONFIG_FILENAME = 'savedAdapterConfig.json';
    const writeSavedAdapterConfig = (json) => {
        fs.writeFile(SAVED_CONFIG_FILENAME, json, 'utf8', () => console.log('Saved config to disk'));
    };

    const loadSavedAdapterConfig = (loadedCallback) => {
        fs.readFile(SAVED_CONFIG_FILENAME, 'utf8', (err, data) => {
            if (err) {
                console.error('Failed to load saved config', err);
            } else {
                console.log('Loaded saved config from disk');
                loadedCallback(JSON.parse(data));
            }
        });
    };

    export default {
        name: 'network-interfaces',
        data() {
            return {
                networkInterfaces: Object.assign({}, os.networkInterfaces()),
                savedAdapters: Object.assign({}),
                selectedAddToAdapter: '',
                addIPv4Address: '',
                addSubnet: '',
                addIPv6Address: ''
            }
        },
        mounted() {
            setInterval(() => {
                let currentNetworkInterfaces = os.networkInterfaces();
                let diffs = detailedDiff(this.networkInterfaces, currentNetworkInterfaces);
                if (Object.entries(diffs.added).length !== 0)
                    networkEventEmitter.emit('added', diffs.added);
                if (Object.entries(diffs.deleted).length !== 0)
                    networkEventEmitter.emit('deleted', diffs.deleted);
                if (Object.entries(diffs.updated).length !== 0)
                    networkEventEmitter.emit('updated', diffs.updated);

                this.networkInterfaces = Object.assign({}, currentNetworkInterfaces);
            }, 2000);

            loadSavedAdapterConfig((loadedConfig) => {
                this.savedAdapters = Object.assign({}, loadedConfig)
            });

        },
        methods: {
            saveAdapterConfig: function (event, adapterName) {
                let updatedSavedAdapters = Object.assign({}, this.savedAdapters);
                updatedSavedAdapters[adapterName] = {};
                updatedSavedAdapters[adapterName] = this.networkInterfaces[adapterName];
                this.savedAdapters = Object.assign({}, updatedSavedAdapters);
                writeSavedAdapterConfig(JSON.stringify(this.savedAdapters));
            },
            removeSavedAdapterConfig: function (event, adapterName) {
                let updatedSavedAdapters = Object.assign({}, this.savedAdapters);
                delete updatedSavedAdapters[adapterName];
                this.savedAdapters = Object.assign({}, updatedSavedAdapters);
                writeSavedAdapterConfig(JSON.stringify(this.savedAdapters));
            },
            applySavedAdapterConfig: function(event) {
                console.log('Applying saved adapter config...');
                applyAdapterConfig(this.savedAdapters);
            },
            executeAddIPv4Address: function(event) {
                addAdapterIPv4Address(this.selectedAddToAdapter, this.addIPv4Address, this.addSubnet);
                this.addIPv4Address = '';
                this.addSubnet = '';
            },
            executeAddIPv6Address: function(event) {
                addAdapterIPv6Address(this.selectedAddToAdapter, this.addIPv6Address);
                this.addIPv6Address = '';
            },
            executeRemoveAddress: function($event, adapterName, nic) {
                let ipVersion = 4;
                if (nic.family === 'IPv6')
                    ipVersion = 6;
                deleteAdapterAddress(adapterName, nic.address, ipVersion);
            }
        }
    }
</script>

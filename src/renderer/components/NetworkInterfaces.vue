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
    const netsh = require('windows-ip-config');
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

    const applyAdapterConfig = (savedAdapters) => {
        for (const adapter of Object.keys(savedAdapters)) {
            let currentAdapterConfig = getNetworkInterfacesFiltered()[adapter];
            if (!currentAdapterConfig)
                throw new Error('Adapter is not available in current adapters. Looking for: ' + adapter);
            // Iterate over current adapter and remove its IP addresses
            for (const nic of currentAdapterConfig) {
                console.log(nic);
                let ipVersion = 4;
                if (nic.family === 'IPv6')
                    ipVersion = 6;
                netsh.deleteAdapterAddress(adapter, nic.address, ipVersion);
            }
            // Iterate over saved adapter and add its IP addresses
            for (const nic of savedAdapters[adapter]) {
                if (nic.family === 'IPv6')
                    netsh.addAdapterIPv6Address(adapter, nic.cidr);
                else
                    netsh.addAdapterIPv4Address(adapter, nic.address, nic.netmask);
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

    const getNetworkInterfacesFiltered = () => {
        const filteredOutAdapterNames = [
            'Loopback Pseudo-Interface 1'
        ];
        let networkInterfaces = Object.assign({}, os.networkInterfaces());
        for (let filteredName of filteredOutAdapterNames) {
            if (networkInterfaces.hasOwnProperty(filteredName))
                delete networkInterfaces[filteredName]
        }
        return networkInterfaces;
    };

    export default {
        name: 'network-interfaces',
        data() {
            return {
                networkInterfaces: Object.assign({}, getNetworkInterfacesFiltered()),
                savedAdapters: Object.assign({}),
                selectedAddToAdapter: '',
                addIPv4Address: '',
                addSubnet: '',
                addIPv6Address: ''
            }
        },
        mounted() {
            setInterval(() => {
                let currentNetworkInterfaces = getNetworkInterfacesFiltered();
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
                netsh.addAdapterIPv4Address(this.selectedAddToAdapter, this.addIPv4Address, this.addSubnet);
                this.addIPv4Address = '';
                this.addSubnet = '';
            },
            executeAddIPv6Address: function(event) {
                netsh.addAdapterIPv6Address(this.selectedAddToAdapter, this.addIPv6Address);
                this.addIPv6Address = '';
            },
            executeRemoveAddress: function($event, adapterName, nic) {
                let ipVersion = 4;
                if (nic.family === 'IPv6')
                    ipVersion = 6;
                netsh.deleteAdapterAddress(adapterName, nic.address, ipVersion);
            }
        }
    }
</script>

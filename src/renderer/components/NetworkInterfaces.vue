<template>
    <div id="wrapper">
        <main>
            <h1>Current Adapter Configurations</h1>
            <div>
                <ul>
                    <li v-for="(nics, adapterName, index) in networkInterfaces" v-bind:key="index">
                        <button v-on:click="saveAdapterConfig($event, adapterName)">Save Adapter Configuration</button>
                        {{ adapterName }}
                        <ul>
                            <li v-for="(nic, nicIndex) in nics" v-bind:key="nicIndex">
                                {{ nic.address }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>

            <h1>Saved Adapter Configurations</h1>
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

    const {exec} = require('child_process');

    /*
    To dump or export the TCP/IP configuration, use this command:
        netsh -c interface dump > PATH_AND_FILENAME.txt
    Use this command to import the TCP/IP configuration:
        netsh -f PATH_AND_FILENAME.txt

        netsh -c interface ip dump
        netsh -c interface ipv6 dump
     */
    // setTimeout(() => {
    //     const ls = exec('netsh interface ip add address name="Ethernet 34" address=192.168.168.101 mask=255.255.255.0', function (error, stdout, stderr) {
    //         if (error) {
    //             console.log(error.stack);
    //             console.log('Error code: '+error.code);
    //             console.log('Signal received: '+error.signal);
    //         }
    //         console.log('Child Process STDOUT: '+stdout);
    //         console.log('Child Process STDERR: '+stderr);
    //     });
    //
    //     ls.on('exit', function (code) {
    //         console.log('Child process exited with exit code '+code);
    //     });
    // }, 5000);


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
                savedAdapters: Object.assign({})
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
            }
        }
    }
</script>

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
    const EventEmitter = require('events').EventEmitter;
    import { detailedDiff } from 'deep-object-diff';

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

    export default {
        name: 'network-interfaces',
        data () {
            return {
                networkInterfaces: Object.assign({}, os.networkInterfaces())
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
            }, 2000)
        }
    }
</script>

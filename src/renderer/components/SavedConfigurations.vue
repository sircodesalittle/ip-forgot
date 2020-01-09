<template>
    <div id="wrapper" class="container is-fluid">
        <main>
            <div class="columns is-multiline">
                <div v-for="(nics, adapterName, index) in savedAdapterConfigurations" v-bind:key="index"
                     class="column is-one-third">
                    <div class="card">
                        <header class="card-header">
                            <p class="card-header-title">
                                {{ adapterName }}
                            </p>
                        </header>
                        <div class="card-content">
                            <div class="content">
                                <ul style="list-style: none;">
                                    <li v-for="(nic, index) in nics" v-bind:key="index">
                                        <span class="tag is-light is-link is-medium">{{ nic.address }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <footer class="card-footer">
                            <a class="card-footer-item"
                               v-on:click="openCurrentAdapters(nics)">
                                Apply
                            </a>
                            <a class="card-footer-item" v-on:click="removeSavedAdapterConfig(adapterName)">
                                Delete
                            </a>
                        </footer>
                    </div>
                </div>
            </div>
        </main>
        <div class="modal" v-bind:class="{ 'is-active': showApplyConfiguration }">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Current Adapters</p>
                    <button class="delete" aria-label="close" v-on:click="showApplyConfiguration = false"/>
                </header>
                <section class="modal-card-body">
                    <div class="columns is-multiline">
                        <div v-for="(nics, adapterName, index) in networkInterfaces" v-bind:key="index"
                             class="column is-half">
                            <div class="card">
                                <header class="card-header">
                                    <p class="card-header-title">
                                        {{ adapterName }}
                                    </p>
                                </header>
                                <div class="card-content">
                                    <div class="content">
                                        <ul style="list-style: none;">
                                            <li v-for="(nic, nicIndex) in nics" v-bind:key="nicIndex">
                                                <span class="tag is-light is-link is-medium">{{ nic.address }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <footer class="card-footer">
                                    <a class="card-footer-item"
                                       v-on:click="applySavedConfigToAdapter(adapterName)">
                                        Apply
                                    </a>
                                </footer>
                            </div>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" v-on:click="showApplyConfiguration = false">Cancel</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    let fs = require('fs');
    export default {
        name: 'network-interfaces',
        data() {
            return {
                selectedAddToAdapter: '',
                IPv4AddressToAdd: '',
                SubnetToAdd: '',
                IPv6AddressToAdd: '',
                showAddIPAddress: false,
                ipType: 'ipv4',
                showApplyConfiguration: false,
                showEditConfigurationName: false,
                configurationName: '',
                selectedNic: {},
            }
        },
        computed: {
            ...mapState({
                networkInterfaces: state => state.Adapters.networkInterfaces,
                savedAdapterConfigurations: state => state.Configurations.savedAdapterConfigurations,
            })
        },
        methods: {
            openCurrentAdapters: function (nic) {
                this.showApplyConfiguration = true;
                this.selectedNics = nic;
            },
            removeSavedAdapterConfig: function (adapterName) {
                this.$store.dispatch('REMOVE_ADAPTER_CONFIGURATION', {adapterName});
            },
            applySavedConfigToAdapter: function (adapterName) {
                this.showApplyConfiguration = false;
                let nicConfiguration = this.selectedNics;
                this.$store.dispatch('APPLY_SAVED_ADAPTER_CONFIG', {adapterName, nicConfiguration});
            },
        }
    }
</script>

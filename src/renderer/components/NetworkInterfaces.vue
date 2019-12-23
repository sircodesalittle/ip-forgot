<template>
    <div id="wrapper" class="container is-fluid">
        <main>
            <div class="columns is-multiline">
                <div v-for="(nics, adapterName, index) in networkInterfaces" v-bind:key="index"
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
                                        <div class="tags has-addons">
                                            <a class="tag is-delete is-medium" v-on:click="removeAddress(adapterName, nic)"></a>
                                            <span class="tag is-light is-link is-medium">{{ nic.address }}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <footer class="card-footer">
                            <a class="card-footer-item" v-on:click="openEditConfigurationName(nics, true)">
                                Save</a>
                            <a class="card-footer-item" v-on:click="openAddIPAddress(adapterName)">
                                Add</a>
                            <a class="card-footer-item"
                               v-on:click="openSavedConfigurations(adapterName)">
                                Apply</a>
                        </footer>
                    </div>
                </div>
            </div>
        </main>
        <div class="modal" v-bind:class="{ 'is-active': showAddIPAddress }">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Add IP Address</p>
                    <button class="delete" aria-label="close" v-on:click="showAddIPAddress = false"/>
                </header>
                <section class="modal-card-body">
                    <div class="control">
                        <label class="radio">
                            <input type="radio" name="ip_type" value="ipv4" v-model="ipType" checked>
                            IPv4
                        </label>
                        <label class="radio">
                            <input type="radio" name="ip_type" value="ipv6" v-model="ipType">
                            IPv6
                        </label>
                    </div>
                    <div v-if="ipType === 'ipv4'">
                        <label for="addAddressInput">Address: </label>
                        <input name="addAddressInput" id="addAddressInput" v-model="IPv4AddressToAdd"
                               placeholder="192.168.168.133" autofocus>

                        <label for="addAddressSubnetInput">Subnet: </label>
                        <input name="addAddressSubnetInput" id="addAddressSubnetInput" v-model="SubnetToAdd"
                               placeholder="255.255.255.0">
                    </div>
                    <div v-if="ipType === 'ipv6'">
                        <label for="addIPv6AddressInput">Address: </label>
                        <input name="addIPv6AddressInput" id="addIPv6AddressInput" v-model="IPv6AddressToAdd"
                               placeholder="fe80::192:168:168:99/64">
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button v-if="ipType === 'ipv4'" class="button is-success"
                            v-on:click="addIPv4Address(selectedAddToAdapter, IPv4AddressToAdd, SubnetToAdd)">
                        Add IPv4 Address
                    </button>
                    <button v-if="ipType === 'ipv6'" class="button is-success"
                            v-on:click="addIPv6Address(selectedAddToAdapter, IPv6AddressToAdd)">
                        Add IPv6 Address
                    </button>
                    <button class="button" v-on:click="showAddIPAddress = false">Cancel</button>
                </footer>
            </div>
        </div>
        <div class="modal" v-bind:class="{ 'is-active': showEditConfigurationName }">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Edit Configuration Name</p>
                    <button class="delete" aria-label="close" v-on:click="showEditConfigurationName = false"/>
                </header>
                <section class="modal-card-body">
                    <label for="configurationName">Name: </label>
                    <input name="configurationName" id="configurationName" v-model="configurationName"
                           placeholder="Ethernet 1" autofocus>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success"
                            v-on:click="saveAdapterConfig(configurationName, selectedNics)">
                        Save Configuration
                    </button>
                    <button class="button" v-on:click="showEditConfigurationName = false">Cancel</button>
                </footer>
            </div>
        </div>
        <div class="modal" v-bind:class="{ 'is-active': showApplyConfiguration }">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Saved Adapter Configurations</p>
                    <button class="delete" aria-label="close" v-on:click="showApplyConfiguration = false"/>
                </header>
                <section class="modal-card-body">
                    <div class="columns is-multiline">
                        <div v-for="(nics, adapterName, index) in savedAdapterConfigurations" v-bind:key="index"
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
                                                {{ nic.address }}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <footer class="card-footer">
                                    <a class="card-footer-item"
                                       v-on:click="applySavedAdapterConfig(selectedAddToAdapter, nics)">
                                        Apply
                                    </a>
                                    <a class="card-footer-item" v-on:click="removeSavedAdapterConfig(adapterName)">
                                        Delete
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
                selectedNics: {},
            }
        },
        computed: {
            ...mapState({
                networkInterfaces: state => state.Adapters.networkInterfaces,
                savedAdapterConfigurations: state => state.Configurations.savedAdapterConfigurations,
            })
        },
        methods: {
            openEditConfigurationName: function (nic, showEditConfigurationName) {
                this.selectedNics = nic;
                this.showEditConfigurationName = showEditConfigurationName;
            },
            openAddIPAddress: function (adapterName) {
                this.showAddIPAddress = true;
                this.selectedAddToAdapter = adapterName;
            },
            openSavedConfigurations: function (adapterName) {
                this.showApplyConfiguration = true;
                this.selectedAddToAdapter = adapterName;
            },
            saveAdapterConfig: function (adapterName, nics) {
                this.showEditConfigurationName = false;
                this.$store.dispatch('ADD_ADAPTER_CONFIGURATION', {adapterName, nics});
            },
            removeSavedAdapterConfig: function (adapterName) {
                this.$store.dispatch('REMOVE_ADAPTER_CONFIGURATION', {adapterName});
            },
            applySavedAdapterConfig: function (adapterName, nicConfiguration) {
                this.showApplyConfiguration = false;
                this.$store.dispatch('APPLY_SAVED_ADAPTER_CONFIG', {adapterName, nicConfiguration});
            },
            addIPv4Address(selectedAddToAdapter, IPv4AddressToAdd, SubnetToAdd) {
                this.showAddIPAddress = false;
                this.$store.dispatch('ADD_IPV4_ADDRESS_TO_ADAPTER', {
                    selectedAddToAdapter,
                    IPv4AddressToAdd,
                    SubnetToAdd
                });
            },
            addIPv6Address(selectedAddToAdapter, IPv6AddressToAdd) {
                this.showAddIPAddress = false;
                this.$store.dispatch('ADD_IPV6_ADDRESS_TO_ADAPTER', {selectedAddToAdapter, IPv6AddressToAdd});
                this.addIPv6Address = '';
            },
            removeAddress(adapterName, nic) {
                this.$store.dispatch('REMOVE_IP_ADDRESS_TO_ADAPTER', {adapterName, nic});
            }
        }
    }
</script>

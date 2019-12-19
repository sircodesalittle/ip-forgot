<template>
    <div id="wrapper">
        <main>
            <div class="tabs">
                <ul>
                    <li v-bind:class="{'is-active': showNetworkInterfaces}"><a v-on:click="openNetworkInterfaces()">Network
                        Interfaces</a></li>
                    <li v-bind:class="{'is-active': showSavedConfigurations}"><a v-on:click="openSavedConfigurations()">Saved
                        Configurations</a></li>
                </ul>
            </div>
            <div v-if="showNetworkInterfaces">
                <network-interfaces/>
            </div>
            <div v-if="showSavedConfigurations">
                <saved-configurations/>
            </div>
        </main>
    </div>
</template>

<script>
    import NetworkInterfaces from './NetworkInterfaces'
    import SavedConfigurations from "./SavedConfigurations";

    export default {
        name: 'landing-page',
        components: {NetworkInterfaces, SavedConfigurations},
        data() {
            return {
                showNetworkInterfaces: true,
                showSavedConfigurations: false,
            }
        },
        mounted() {
            setInterval(() => {
                this.$store.dispatch('REFRESH_ADAPTERS');
            }, 2000);

            this.$store.dispatch('LOAD_ADAPTER_CONFIGURATIONS');

        },
        methods: {
            openSavedConfigurations: function () {
                this.showSavedConfigurations = true;
                this.showNetworkInterfaces = false;
            },
            openNetworkInterfaces: function () {
                this.showSavedConfigurations = false;
                this.showNetworkInterfaces = true;
            },
        }
    }
</script>

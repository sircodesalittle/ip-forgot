const os = require('os');
const netsh = require('windows-ip-config');

const state = {
    networkInterfaces: Object.assign({}),
}

const mutations = {
    REFRESH_ADAPTERS (state) {
        const filteredOutAdapterNames = [
            'Loopback Pseudo-Interface 1'
        ];
        let newNetworkInterfaces = Object.assign({}, os.networkInterfaces());
        for (let filteredName of filteredOutAdapterNames) {
            if (newNetworkInterfaces.hasOwnProperty(filteredName))
                delete newNetworkInterfaces[filteredName]
        }
        state.networkInterfaces = newNetworkInterfaces;
    },

    ADD_IPV4_ADDRESS_TO_ADAPTER (state, {selectedAddToAdapter, IPv4AddressToAdd, SubnetToAdd}) {
        netsh.addAdapterIPv4Address(selectedAddToAdapter, IPv4AddressToAdd, SubnetToAdd);
    },

    ADD_IPV6_ADDRESS_TO_ADAPTER (state, {selectedAddToAdapter, IPv6AddressToAdd}) {
        netsh.addAdapterIPv6Address(selectedAddToAdapter, IPv6AddressToAdd);
    },

    REMOVE_IP_ADDRESS_TO_ADAPTER (state, {adapterName, nic}) {
        let ipVersion = 4;
        if (nic.family === 'IPv6')
            ipVersion = 6;
        netsh.deleteAdapterAddress(adapterName, nic.address, ipVersion);
    },

    APPLY_SAVED_ADAPTER_CONFIG(state, {adapterName, nicConfiguration}) {
        let currentAdapterConfig = state.networkInterfaces[adapterName];
        if (!currentAdapterConfig)
            throw new Error('Adapter is not available in current adapters. Looking for: ' + adapterName);
        // Iterate over current adapter and remove its IP addresses
        for (const nic of currentAdapterConfig) {
            let ipVersion = 4;
            if (nic.family === 'IPv6')
                ipVersion = 6;
            netsh.deleteAdapterAddress(adapterName, nic.address, ipVersion);
        }
        // Iterate over saved adapter and add its IP addresses
        for (const nic of nicConfiguration) {
            if (nic.family === 'IPv6')
                netsh.addAdapterIPv6Address(adapterName, nic.cidr);
            else
                netsh.addAdapterIPv4Address(adapterName, nic.address, nic.netmask);
        }
    }
}

const actions = {
    REFRESH_ADAPTERS ({ commit }) {
        commit('REFRESH_ADAPTERS');
    },

    ADD_IPV4_ADDRESS_TO_ADAPTER ({ commit }, {selectedAddToAdapter, IPv4AddressToAdd, SubnetToAdd}) {
        commit('ADD_IPV4_ADDRESS_TO_ADAPTER', {selectedAddToAdapter, IPv4AddressToAdd, SubnetToAdd});
    },

    ADD_IPV6_ADDRESS_TO_ADAPTER ({ commit }, {selectedAddToAdapter, IPv6AddressToAdd}) {
        commit('ADD_IPV6_ADDRESS_TO_ADAPTER', {selectedAddToAdapter, IPv6AddressToAdd});
    },

    REMOVE_IP_ADDRESS_TO_ADAPTER ({ commit }, {adapterName, nic}) {
        commit('REMOVE_IP_ADDRESS_TO_ADAPTER', {adapterName, nic});
    },

    APPLY_SAVED_ADAPTER_CONFIG({ commit }, {adapterName, nicConfiguration}) {
        // commit('REFRESH_ADAPTERS');
        commit('APPLY_SAVED_ADAPTER_CONFIG', {adapterName, nicConfiguration})
    }

}

export default {
    state,
    mutations,
    actions,
}

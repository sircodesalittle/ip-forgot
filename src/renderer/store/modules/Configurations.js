let fs = require('fs');
const SAVED_CONFIG_FILENAME = 'savedAdapterConfig.json';



const state = {
    savedAdapterConfigurations: Object.assign({}),
}

const mutations = {
    ADD_ADAPTER_CONFIGURATION (state, {adapterName, nics}) {
        let updatedSavedAdapters = Object.assign({}, state.savedAdapterConfigurations);
        updatedSavedAdapters[adapterName] = {};
        updatedSavedAdapters[adapterName] = nics;
        state.savedAdapterConfigurations = Object.assign({}, updatedSavedAdapters);
        fs.writeFile(SAVED_CONFIG_FILENAME, JSON.stringify(state.savedAdapterConfigurations), 'utf8', () => console.log('Saved config to disk'));
    },

    REMOVE_ADAPTER_CONFIGURATION (state, {adapterName}) {
        let updatedSavedAdapters = Object.assign({}, state.savedAdapterConfigurations);
        delete updatedSavedAdapters[adapterName];
        state.savedAdapterConfigurations = Object.assign({}, updatedSavedAdapters);
        fs.writeFile(SAVED_CONFIG_FILENAME, JSON.stringify(state.savedAdapterConfigurations), 'utf8', () => console.log('Saved config to disk'));
    },

    REFRESH_ADAPTER_CONFIGURATIONS(state, adapterConfigurations) {
        state.savedAdapterConfigurations = adapterConfigurations;
    },

}

const actions = {
    ADD_ADAPTER_CONFIGURATION({ commit }, {adapterName, nics}) {
        commit('ADD_ADAPTER_CONFIGURATION', {adapterName, nics});
    },

    REMOVE_ADAPTER_CONFIGURATION({ commit }, {adapterName}) {
        commit('REMOVE_ADAPTER_CONFIGURATION', {adapterName});
    },

    LOAD_ADAPTER_CONFIGURATIONS({ commit }) {
        fs.readFile(SAVED_CONFIG_FILENAME, 'utf8', (err, data) => {
            if (err) {
                console.error('Failed to load saved config', err);
            } else {
                console.log('Loaded saved config from disk');
                commit('REFRESH_ADAPTER_CONFIGURATIONS', JSON.parse(data));
            }
        });
    }
}

export default {
    state,
    mutations,
    actions,
}

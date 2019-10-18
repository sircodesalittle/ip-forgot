<template>
  <div id="app" class="columns is-multiline">
    <div v-for="(profile, index) in profiles" :key="index" class="column is-one-fifth">
      <ProfileCard :profile="profile"/>
    </div>
  </div>
</template>

<script>
import ProfileCard from './components/ProfileCard.vue'

export default {
  name: 'app',
  components: {
    ProfileCard
  },
  data: function () {
    return {
      profiles: [{name: 'Profile 1', ipAddresses: ['172.31.215.42']}, {name: 'Profile 2', ipAddresses: ['172.31.21.42']},
        {name: 'Profile 3', ipAddresses: ['255.31.215.42']}, {name: 'Profile 4', ipAddresses: ['172.531.215.42']},
        {name: 'Profile 5', ipAddresses: ['fe::80']}, {name: 'Profile 6', ipAddresses: ['172.31.123.42']},
        {name: 'Profile 7', ipAddresses: ['172.31.215.56']}, {name: 'Profile 8', ipAddresses: ['112.31.215.42']},]
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

<template>
  <div id="app">
    <RepoList tableTitle="Test Title" />
  </div>
</template>

<script>
import RepoList from './components/RepoList.vue';

export default {
  name: 'App',
  components: {
    RepoList,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
}
</style>

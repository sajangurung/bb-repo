<template>
  <div class="spinner-grow" role="status" v-if="isLoading">
    >
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    isLoading: Boolean,
  },
};
</script>

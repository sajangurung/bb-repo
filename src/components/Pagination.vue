<template>
  <nav>
    <ul class="pagination">
      <li class="page-item" v-if="showPrev">
        <a class="page-link" aria-label="Previous" v-on:click="previous">
          <span aria-hidden="true">&laquo;</span>
          <span class="sr-only">Previous</span>
        </a>
      </li>
      <li
        class="page-item"
        v-for="pageIndex in pages"
        :key="pageIndex"
        v-bind:class="{ active: pageIndex === currentPage }"
      >
        <a class="page-link" v-on:click="current(pageIndex)">{{ pageIndex }}</a>
      </li>
      <li class="page-item" v-if="showNext">
        <a class="page-link" aria-label="Next" v-on:click="next">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">Next</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    pages: {
      type: Array,
    },
    currentPage: Number,
  },
  methods: {
    previous() {
      this.$emit('clicked', this.pages[0] - 1);
    },
    next() {
      const lastIndex = this.pages.length - 1;
      this.$emit('clicked', this.pages[lastIndex] + 1);
    },
    current(value) {
      this.$emit('clicked', value);
    },
    showPrev() {
      return this.pages[0] > 1;
    },
    showNext() {
      return true;
    },
  },
};
</script>

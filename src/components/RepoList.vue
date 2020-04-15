<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12 d-flex align-items-start">
        <div>
          <Pagination
            :currentPage="currentPage"
            :pages="pages"
            v-on:clicked="onPageClicked"
            v-if="pages"
          />
        </div>
        <div>
          <Loading v-bind:is-loading="isLoading"> </Loading>
        </div>
      </div>
    </div>
    <div v-if="items.length" class="row d-flex flex-wrap">
      <div class="col-lg-3 col-sm-6 mb-3" v-for="item in items" :key="item.uuid">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ item.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">{{ item.owner.display_name }}</h6>
            <p class="card-text">
              <small class="text-muted">Last updated {{ item.updated_on }}</small>
            </p>
            <p class="card-text">
              {{ item.pipelines.length ? 'Last Pipeline status: ' + item.pipelines[0] : 'n/a' }}
            </p>
            <a href="#" class="card-link">
              {{ item.environments.length ? item.environments.length + ' environments' : 'n/a' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import formatRelative from 'date-fns/formatRelative';
import parseISO from 'date-fns/parseISO';
import Pagination from './Pagination.vue';
import Loading from './Loading.vue';
import parseToken from '../utils/parse-token';
import config from '../config';

export default {
  name: 'RepoList',
  props: {
    tableTitle: String,
  },
  components: {
    Pagination,
    Loading,
  },
  methods: {
    onPageClicked(event) {
      this.$router.push({ name: 'repo', params: { pageIndex: event } });
    },
    async query(url) {
      this.isLoading = true;
      try {
        const response = await Vue.axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        this.isLoading = false;
        return response;
      } catch (error) {
        this.isLoading = false;
        if (error.statusCode === 401) {
          window.location.href = config.BITBUCKET_LOGIN_REDIRECT;
        }
        localStorage.removeItem('access_token');

        return undefined;
      }
    },
    async queryAll(url, list) {
      const result = await this.query(url);
      const updatedResult = list.data.values
        ? {
          ...result,
          data: {
            ...list.data,
            values: [...list.data.values, ...result.data.values],
          },
        }
        : result;
      if (result.data.next) {
        const updated = await this.queryAll(result.data.next, updatedResult);
        return {
          ...updated,
          data: {
            ...updated.data,
            values: [...updatedResult.data.values, ...updated.data.values],
          },
        };
      }

      return updatedResult;
    },
    async getRepos() {
      const { pageIndex } = this.$route.params;
      const teams = await this.query(this.teamsUrl);
      const org = teams.data.values.find((team) => team.username === config.VUE_APP_ORG_NAME);
      if (org) {
        const url = pageIndex
          ? `${org.links.repositories.href}?page=${pageIndex}&pagelen=20&sort=-updated_on`
          : `${org.links.repositories.href}?pagelen=20&sort=updated_on`;
        const repositories = await this.query(url);
        const resolvedValues = repositories.data.values.map(async (item) => {
          const environments = await this.query(this.deploymentUrl(item.owner.uuid, item.slug));
          const pipelines = await this.query(this.pipelineUrl(item.owner.uuid, item.slug));

          return {
            ...item,
            updated_on: formatRelative(parseISO(item.updated_on), new Date()),
            environments: environments.data.values
              ? environments.data.values.map((e) => e.name)
              : [],
            pipelines: pipelines.data.values ? pipelines.data.values.map((p) => p.state.name) : [],
          };
        });
        this.items = await Promise.all(resolvedValues);

        const { pagelen, size, page } = repositories.data;
        this.pages = [...Array(Math.floor(size / pagelen)).keys()].map((key) => key + 1);
        this.currentPage = page;
      }
    },
  },
  data() {
    return {
      title: this.tableTitle,
      isLoading: false,
      items: [],
      pages: this.pages,
      currentPage: 0,
      teamsUrl: 'teams?role=member',
      pipelineUrl(workspaceId, repoSlug) {
        return `repositories/${workspaceId}/${repoSlug}/pipelines/`;
      },
      deploymentUrl(workspaceId, repoSlug) {
        return `repositories/${workspaceId}/${repoSlug}/environments/`;
      },
    };
  },
  computed: {
    pageIndex() {
      return this.$route.params.pageIndex;
    },
    token() {
      return parseToken(this.$route.path) || localStorage.access_token;
    },
  },
  watch: {
    token(val) {
      localStorage.access_token = val;
    },
    $route: 'getRepos',
  },
  created() {},
  async mounted() {
    if (this.token) {
      localStorage.access_token = this.token;
    }
    if (!localStorage.access_token) {
      window.location.href = config.BITBUCKET_LOGIN_REDIRECT;
      return;
    }
    await this.getRepos();
  },
};
</script>

<style>
.card:hover {
  background: rgb(248, 248, 248);
}
</style>

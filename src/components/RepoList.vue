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
    <table class="table table-bordered table-responsive-md" v-if="items.length">
      <thead>
        <tr>
          <!-- <th width="16.66%">#</th> -->
          <th width="16.66%">Repository Name</th>
          <th width="16.66%">Repository Owner</th>
          <th width="16.66%">Language</th>
          <th width="16.66%">Last Updated</th>
          <th width="16.66%">Deployment Environments</th>
          <th width="16.66%">Last Pipeline Status</th>
        </tr>
        <tr v-for="item in items" :key="item.uuid">
          <!-- <th width="16.66%">{{ item.uuid }}</th> -->
          <th width="16.66%">{{ item.name }}</th>
          <th width="16.66%">{{ item.owner.display_name }}</th>
          <th width="16.66%">{{ item.language || 'n/a' }}</th>
          <th width="16.66%">{{ new Date(item.updated_on).toLocaleString() }}</th>
          <th width="16.66%">{{ item.environments.length ? item.environments : 'n/a' }}</th>
          <th width="16.66%">
            {{ item.pipelines.length ? item.pipelines[0] : 'n/a' }}
          </th>
        </tr>
      </thead>
    </table>
  </div>
</template>

<script>
import Vue from 'vue';
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
      const org = teams.data.values.find((team) => team.username === config.ORG_NAME);
      if (org) {
        const url = pageIndex
          ? `${org.links.repositories.href}?page=${pageIndex}`
          : org.links.repositories.href;
        const repositories = await this.query(url);
        const resolvedValues = repositories.data.values.map(async (item) => {
          const environments = await this.query(this.deploymentUrl(item.owner.uuid, item.slug));
          const pipelines = await this.query(this.pipelineUrl(item.owner.uuid, item.slug));

          return {
            ...item,
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

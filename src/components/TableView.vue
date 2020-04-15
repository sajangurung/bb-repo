<template>
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
</template>

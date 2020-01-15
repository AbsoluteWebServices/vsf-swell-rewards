<template>
  <section class="swell-rewards-history-list-container">
    <table class="swell-rewards-history-table">
      <slot name="thead" :rewards-history="getCustomerHistory">
        <thead>
          <tr>
            <th>{{ $t('Date') }}</th>
            <th>{{ $t('Action') }}</th>
            <th>{{ $t('Points') }}</th>
            <th>{{ $t('Status') }}</th>
          </tr>
        </thead>
      </slot>
      <slot name="tbody" :rewards-history="getCustomerHistory">
        <tbody>
          <tr v-for="(reward, index) in getCustomerHistory" :key="index">
            <td>{{ reward.date }}</td>
            <td>{{ reward.action }}</td>
            <td>{{ reward.points }}</td>
            <td>{{ reward.status }}</td>
          </tr>
        </tbody>
      </slot>
      <slot name="tfoot" :rewards-history="getCustomerHistory" />
    </table>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { KEY } from '../index'

export default {
  name: 'MyRewards',
  computed: {
    ...mapGetters(KEY, ['getCustomerHistory'])
  }
}
</script>

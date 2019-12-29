<template>
  <section class="swell-redemption-options-list-container">
    <table class="swell-redemption-options-table">
      <thead>
        <tr>
          <th>
            {{ $t('Points Earned') }}
          </th>
          <th>
            {{ $t('Reward') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="redemptionOption in redemptionOptions" :key="redemptionOption.id">
          <td>
            {{ redemptionOption.cost_text }}
          </td>
          <td>
            {{ redemptionOption.discount_amount_cents / 100 | price }}
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { KEY } from '../index'

export default {
  name: 'RedemptionOptions',
  computed: {
    ...mapState(KEY, ['redemptionOptions'])
  },
  serverPrefetch () {
    return this.fetchActiveRedemptionOptions()
  },
  mounted () {
    if (!this.redemptionOptions.length) {
      this.fetchActiveRedemptionOptions()
    }
  },
  methods: {
    fetchActiveRedemptionOptions () {
      return this.$store.dispatch(KEY + '/fetchActiveRedemptionOptions')
    }
  }
}
</script>

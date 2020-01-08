<template>
  <section class="swell-weward-select-container">
    <slot name="select" :reward-options="rewardOptions" :selected-reward-id="selectedRewardId" :select-reward="selectReward">
      <select v-model="selectedRewardId">
        <option v-for="(option, key) in rewardOptions" :key="key" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </slot>
    <slot name="button" :make-redemption="makeRedemption">
      <button @click="makeRedemption" type="button">
        {{ $t('Apply') }}
      </button>
    </slot>
  </section>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import i18n from '@vue-storefront/i18n'
import { KEY } from '../index'

const monthNames = [
  i18n.t('Jan'),
  i18n.t('Feb'),
  i18n.t('Mar'),
  i18n.t('Apr'),
  i18n.t('May'),
  i18n.t('Jun'),
  i18n.t('Jul'),
  i18n.t('Aug'),
  i18n.t('Sep'),
  i18n.t('Oct'),
  i18n.t('Nov'),
  i18n.t('Dec')
];

export default {
  name: 'RewardSelect',
  data () {
    return {
      selectedRewardId: null
    }
  },
  computed: {
    ...mapState(KEY, ['redemptionOptions']),
    ...mapGetters(KEY, ['getCustomerPoints', 'getCustomerRedeemedRewards']),
    rewardOptions () {
      return this.redemptionOptions.map(item => ({
        label: `${item.name} (${item.cost_text})`,
        value: 'ro_' + item.id,
        reward: item,
        purchased: false
      })).concat(this.getCustomerRedeemedRewards.map(item => {
        const date = new Date(item.approved_at)
        return {
          label: `${item.redemption_option.name} (${i18n.t('Redeemed')} ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()})`,
          value: 'rr_' + item.id,
          reward: item,
          purchased: true
        }
      }))
    },
    selectedReward () {
      if (this.selectedRewardId) {
        for (let i = 0; i < this.rewardOptions.length; i++) {
          const element = this.rewardOptions[i]
          if (this.selectedRewardId === element.value) {
            return element
          }
        }
      }
      return null
    }
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
    },
    selectReward (val) {
      this.selectedRewardId = val
    },
    async makeRedemption () {
      const selectedReward = this.selectedReward
      if (!selectedReward) {
        return
      }

      const reward = selectedReward.reward
      if (selectedReward.purchased && this.$store.dispatch(KEY + '/setActiveRedemption', reward)) {
        this.$emit('reward-purchased', reward.redemption_option.reward_text)
        return
      }

      if (this.getCustomerPoints < reward.amount) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: i18n.t("You don't have enough points to purchase this reward."),
          action1: { label: i18n.t('OK') }
        })
        return
      }

      try {
        const redemption = await this.$store.dispatch(KEY + '/createRedemption', {redemptionOptionId: reward.id})

        if (redemption.approved) {
          this.$emit('reward-purchased', redemption.reward_text)
          this.$store.dispatch(KEY + '/refreshCustomer')
        } else {
          this.$store.dispatch('notification/spawnNotification', {
            type: 'error',
            message: i18n.t("Redemption isn't approved."),
            action1: { label: i18n.t('OK') }
          })
        }
      } catch (resp) {
        if (resp.result && resp.result.error) {
          this.$store.dispatch('notification/spawnNotification', {
            type: 'error',
            message: resp.result.error,
            action1: { label: i18n.t('OK') }
          })
        } else {
          for (const key in resp.result) {
            if (resp.result.hasOwnProperty(key) && resp.result[key].length) {
              this.$store.dispatch('notification/spawnNotification', {
                type: 'error',
                message: resp.result[key][0],
                action1: { label: i18n.t('OK') }
              })
              break
            }
          }
        }
      }
    }
  }
}
</script>

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
      const redeemedOptions = this.getCustomerRedeemedRewards

      return this.redemptionOptions.map(item => {
        let option = {
          label: `${item.name} (${item.cost_text})`,
          value: item.id
        }
        if (redeemedOptions.length) {
          for (let i = 0; i < redeemedOptions.length; i++) {
            const redeemedOption = redeemedOptions[i]

            if (item.amount === redeemedOption.redemption_option.amount && item.name === redeemedOption.redemption_option.name) {
              option.redeemed = redeemedOption
              option.label = `${item.name} (${i18n.t('Purchased')})`
              break
            }
          }
        }
        return option
      })
    },
    selectedReward () {
      if (this.selectedRewardId) {
        for (let i = 0; i < this.redemptionOptions.length; i++) {
          const element = this.redemptionOptions[i]
          if (this.selectedRewardId === element.id) {
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
      this.selectedRewardId = parseInt(val)
    },
    getPurchasedReward (reward) {
      const redeemedOptions = this.getCustomerRedeemedRewards

      for (let i = 0; i < redeemedOptions.length; i++) {
        const redeemedOption = redeemedOptions[i]

        if (reward.amount === redeemedOption.redemption_option.amount && reward.name === redeemedOption.redemption_option.name) {
          return redeemedOption
        }
      }

      return null
    },
    async makeRedemption () {
      const selectedReward = this.selectedReward
      if (!selectedReward) {
        return
      }

      const purchasedReward = this.getPurchasedReward(selectedReward)
      if (purchasedReward && this.$store.dispatch(KEY + '/setActiveRedemption', purchasedReward)) {
        this.$emit('reward-purchased', purchasedReward.reward_text)
        return
      }

      if (this.getCustomerPoints < selectedReward.amount) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: i18n.t("You don't have enough points to purchase this reward."),
          action1: { label: i18n.t('OK') }
        })
        return
      }

      try {
        const redemption = await this.$store.dispatch(KEY + '/createRedemption', {redemptionOptionId: selectedReward.id})

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

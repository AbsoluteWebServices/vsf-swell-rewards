import { GetterTree } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import SwellRewardsState from '../types/SwellRewardsState'

export const getters: GetterTree<SwellRewardsState, RootState> = {
  getCustomerPoints: state => state.customer ? state.customer.points_balance : 0,
  getCustomerReferral: state => state.customer && state.customer.referrer ? state.customer.referrer.code : null,
  getCustomerReferralLink: (state, getters) => medium => {
    if (!getters.getCustomerReferral || !config.swellRewards.referralBase) {
      return null
    }

    let link = config.swellRewards.referralBase + getters.getCustomerReferral

    switch (medium) {
      case 'facebook':
        link += '?f'
        break
      case 'twitter':
        link += '?t'
        break
      case 'sms':
        link += '?s'
        break
      case 'email':
        link += '?e'
        break
      case 'copy_link':
        link += '?c'
        break
    }
    return link
  },
  getCustomerHistory: state => state.customer && state.customer.history_items ? state.customer.history_items : [],
  getCustomerReferrals: state => state.customer && state.customer.referral_receipts ? state.customer.referral_receipts : [],
  getRedemptionRateCents: state => {
    if (state.redemptionOptions && state.redemptionOptions.length) {
      for (let i = 0; i < state.redemptionOptions.length; i++) {
        const option = state.redemptionOptions[i]
        if (option.discount_type && option.discount_type === 'fixed_amount') {
          return option.discount_amount_cents / option.amount
        }
      }
    }
    return 0
  },
  getRedemptionRatePercents: state => {
    if (state.redemptionOptions && state.redemptionOptions.length) {
      for (let i = 0; i < state.redemptionOptions.length; i++) {
        const option = state.redemptionOptions[i]
        if (option.discount_type && option.discount_type === 'percentage') {
          return option.discount_percentage / option.amount
        }
      }
    }
    return 0
  },
  getCustomerRedeemedRewards: state => state.customer && state.customer.point_redemptions ? state.customer.point_redemptions.filter(item => item.approved) : [],
  getCustomerPurchases: state => state.customer && state.customer.purchases ? state.customer.purchases : [],
  getReferralLink: state => state.referralLink,
  getReferralsHistory: state => state.referralsHistory
}

import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import SwellRewardsState from '../types/SwellRewardsState'
import Customer from '../types/Customer'
import RedemptionOption from '../types/RedemptionOption'
import Redemption from '../types/Redemption'
import Campaign from '../types/Campaign'
import VipTier from '../types/VipTier'
import ReferralsHistory from '../types/ReferralsHistory'

export const mutations: MutationTree<SwellRewardsState> = {
  [types.SET_CUSTOMER_ID] (state, customerId: string | number) {
    state.customerId = customerId.toString()
  },
  [types.SET_CUSTOMER] (state, customer: Customer) {
    state.customer = customer
  },
  [types.UPDATE_CUSTOMER] (state, customer: Customer) {
    state.customer = Object.assign({}, state.customer, customer)
  },
  [types.SET_REDEMPTION_OPTIONS] (state, redemptionOptions: RedemptionOption[]) {
    state.redemptionOptions = redemptionOptions
  },
  [types.SET_ACTIVE_REDEMPTION] (state, redemption: Redemption) {
    state.activeRedemption = redemption
  },
  [types.SET_CAMPAIGNS] (state, campaigns: Campaign[]) {
    state.campaigns = campaigns
  },
  [types.SET_VIP_TIERS] (state, vipTiers: VipTier[]) {
    state.vipTiers = vipTiers
  },
  [types.SET_REFERRAL_LINK] (state, referralLink: string) {
    state.referralLink = referralLink
  },
  [types.SET_REFERRALS_HISTORY] (state, referralsHistory: ReferralsHistory[]) {
    state.referralsHistory = referralsHistory
  },
  [types.CLEAR] (state) {
    state.customerId = null
    state.customer = null
    state.redemptionOptions = []
  }
}

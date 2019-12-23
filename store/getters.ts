import { GetterTree } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import SwellRewardsState from '../types/SwellRewardsState'

export const getters: GetterTree<SwellRewardsState, RootState> = {
  getCustomerPoints: state => state.customer ? state.customer.points_balance : 0,
  getCustomerReferral: state => state.customer && state.customer.referral_code ? state.customer.referral_code : null,
  getCustomerHistory: state => state.customer && state.customer.history_items ? state.customer.history_items : []
}

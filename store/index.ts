import { Module } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { state } from './state'
import SwellRewardsState from '../types/SwellRewardsState'

export const module: Module<SwellRewardsState, RootState> = {
  namespaced: true,
  mutations,
  actions,
  getters,
  state
}

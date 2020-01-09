import { KEY } from '../index'
import * as types from '../store/mutation-types'

export function afterRegistration ({ Vue, config, store, isServer }) {
  if (!isServer && config.swellRewards) {
    Vue.prototype.$bus.$emit('swell:initialized')

    Vue.prototype.$bus.$on('user-after-loggedin', async receivedData => {
      store.commit(KEY + '/' + types.SET_CUSTOMER_ID, receivedData.id)
      try {
        await store.dispatch(KEY + '/getCustomerV2', { id: receivedData.id, email: receivedData.email, with_referral_code: true, with_history: true })
      } catch (resp) {
        if (resp.status === 404) {
          await store.dispatch(KEY + '/updateCustomer', receivedData)
          await store.dispatch(KEY + '/getCustomerV2', { id: receivedData.id, email: receivedData.email, with_referral_code: true, with_history: true })
        }
      }
      await store.dispatch(KEY + '/getCustomerV1', receivedData.email)
      Vue.prototype.$bus.$emit('swell:setup')
    })

    Vue.prototype.$bus.$on('user-before-logout', () => {
      store.commit(KEY + '/' + types.CLEAR)
      Vue.prototype.$bus.$emit('swell:setup')
    })
  }
}

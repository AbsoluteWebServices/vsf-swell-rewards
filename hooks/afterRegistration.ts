import { KEY } from '../index'
import * as types from '../store/mutation-types'
import { setTimeout, setInterval, clearInterval } from 'timers'

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const parseDoB = dob => {
  const pieces = dob.split('-')
  if (pieces.length === 3) {
    return {
      day: pieces[2],
      month: pieces[1],
      year: pieces[0]
    }
  }
  return null
}

export function afterRegistration ({ Vue, config, store, isServer }) {
  if (!isServer && config.swellRewards) {
    Vue.prototype.$bus.$emit('swell:initialized')

    let refreshInterval: NodeJS.Timeout
    const refresh = () => {
      try {
        store.dispatch(KEY + '/refreshCustomer', { with_referral_code: true, with_history: true })
      } catch (err) {
        clearInterval(refreshInterval)
      }
    }

    Vue.prototype.$bus.$on('user-after-loggedin', async receivedData => {
      store.commit(KEY + '/' + types.SET_CUSTOMER_ID, receivedData.id)
      try {
        await store.dispatch(KEY + '/getCustomerV2', { id: receivedData.id, email: receivedData.email, with_referral_code: true, with_history: true })
      } catch (resp) {
        if (resp.code === 404) {
          await store.dispatch(KEY + '/updateCustomer', receivedData)
          await sleep(100)

          if (receivedData.dob) {
            const bDate = parseDoB(receivedData.dob)

            if (bDate) {
              await store.dispatch('swell-rewards/setCustomerBirthday', bDate)
            }
          }

          await store.dispatch(KEY + '/getCustomerV2', { id: receivedData.id, email: receivedData.email, with_referral_code: true, with_history: true })
        }
      }
      await store.dispatch(KEY + '/getCustomerV1', receivedData.email)

      refreshInterval = setInterval(refresh, 60000)

      Vue.prototype.$bus.$emit('swell:setup')
    })

    Vue.prototype.$bus.$on('user-before-logout', () => {
      store.commit(KEY + '/' + types.CLEAR)

      clearInterval(refreshInterval)

      Vue.prototype.$bus.$emit('swell:setup')
    })

    Vue.prototype.$bus.$on('myAccount-before-updateUser', async receivedData => {
      await store.dispatch(KEY + '/updateCustomer', receivedData)

      if (receivedData.dob) {
        const bDate = parseDoB(receivedData.dob)

        if (bDate) {
          await store.dispatch('swell-rewards/setCustomerBirthday', bDate)
        }
      }
    })
  }
}

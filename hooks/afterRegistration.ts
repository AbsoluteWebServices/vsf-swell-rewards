import fetch from 'isomorphic-fetch'
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore'
import rootStore from '@vue-storefront/core/store'
import { KEY } from '../index'
import * as types from '../store/mutation-types'

const appendScript = (context, config) => { 
  let jsUrl = `https://cdn.swellrewards.com/loader/${config.swellRewards.guid}.js`
  let docHead = context.document.getElementsByTagName('head')[0]
  let docScript = context.document.createElement('script')

  docScript.type = 'text/javascript'
  docScript.async = true
  docScript.src = jsUrl
  docHead.appendChild(docScript)
}

const appendCustomerDetails = (context, data) => {
  let docBody = context.document.getElementsByTagName('body')[0]
  let customerTag = context.document.createElement('div')

  customerTag.id = 'swell-customer-identification'
  customerTag.style.display = 'none'
  customerTag.setAttribute('data-authenticated', true)
  customerTag.setAttribute('data-email', data.email)
  customerTag.setAttribute('data-id', data.id)
  docBody.appendChild(customerTag)
}

const removeSwellTabs = (context) => {
  let docBody = context.document.getElementsByTagName('body')[0]
  let swellTabs = docBody.getElementsByClassName('swell-tab')
  while (swellTabs.length) {
    swellTabs[0].remove()
  }
}

export function afterRegistration({ Vue, config, store, isServer }) {
  if (!isServer && config.swellRewards && config.swellRewards.guid) {
    const w: any = window
    let initialized = false

    appendScript(w, config)

    w.document.addEventListener('swell:initialized', () => {
      console.log('swell:initialized')
      initialized = true
    })

    w.document.addEventListener('swell:setup', () => {
      console.log('swell:setup')
      console.log(w.swellAPI.getCustomerDetails())
      store.commit(KEY + '/' + types.SET_CUSTOMER, w.swellAPI.getCustomerDetails())
    })

    Vue.prototype.$bus.$on('user-after-loggedin', async receivedData => {
      store.commit(KEY + '/' + types.SET_CUSTOMER_ID, receivedData.id)
      try {
        await store.dispatch(KEY + '/getCustomer', { id: receivedData.id, email: receivedData.email, with_referral_code: true, with_history: true })
      } catch (resp) {
        if (resp.status === 404) {
          await store.dispatch(KEY + '/updateCustomer', receivedData)
          await store.dispatch(KEY + '/getCustomer', { id: receivedData.id, email: receivedData.email, with_referral_code: true, with_history: true })
        }
      }

      // if (initialized) {
      //   removeSwellTabs(w)
      //   w.swellAPI.loginCustomer(receivedData.email, receivedData.id)
      // } else {
      //   appendCustomerDetails(w, receivedData)
      // }
    })

    Vue.prototype.$bus.$on('user-before-logout', () => {
      // if (initialized) {
      //   removeSwellTabs(w)
      //   w.swellAPI.loginCustomer()
      // }
    })

    Vue.prototype.$bus.$on('order-after-placed', event => {

      // let cart = rootStore.state.cart
      // let order = {
      //   ...event.order,
      //   cart
      // }
      // store.dispatch(KEY + '/orderUpdated', order)
    })
  }
}

import { ActionTree } from 'vuex'
import config from 'config'
import fetch from 'isomorphic-fetch'
import { processURLAddress } from '@vue-storefront/core/helpers'
import { adjustMultistoreApiUrl, currentStoreView } from '@vue-storefront/core/lib/multistore'
import RootState from '@vue-storefront/core/types/RootState'
import * as types from './mutation-types'
import SwellRewardsState from '../types/SwellRewardsState'
import Customer from '../types/Customer'
import Redemption from '../types/Redemption'
import RedemptionOption from '../types/RedemptionOption'
import RedemptionCode from '../types/RedemptionCode'
import Campaign from '../types/Campaign'
import VipTier from '../types/VipTier'

export const actions: ActionTree<SwellRewardsState, RootState> = {
  recordAction ({ state }, { action_name, type = 'CustomAction', created_at = Math.round((Date.now()/1000)), reward_points = null, history_title = null }): Promise<Response> {
    if (!state.customer || !state.customer.email) {
      throw new Error('Identified customer required.')
    }

    let url = processURLAddress(config.swell.endpoint) + '/actions'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ 
          type,
          customer_email: state.customer.email,
          action_name,
          user_agent: navigator.userAgent,
          created_at,
          reward_points,
          history_title
         })
      }).then(resp => {
        if (resp.ok) {
          resolve(resp)
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  updateCustomer ({ state, commit }, {id, firstname, lastname, email, pos_account_id = null, tags = []}): Promise<Response> {
    let url = processURLAddress(config.swell.endpoint) + '/customers'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ 
          id: id.toString(),
          first_name: firstname,
          last_name: lastname,
          email,
          pos_account_id,
          tags: tags.join(',')
         })
      }).then(resp => {
        if (resp.ok) {
          commit(types.SET_CUSTOMER, {
            ...state.customer,
            first_name: firstname,
            last_name: lastname,
            pos_account_id,
            tags: tags.join(',')
          })
          resolve(resp)
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  setCustomerBirthday ({ state, commit }, {day, month, year}): Promise<Response> {
    if (!state.customer || !state.customer.email) {
      throw new Error('Identified customer required.')
    }

    let url = processURLAddress(config.swell.endpoint) + '/customer_birthdays'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ 
          customer_email: state.customer.email,
          day,
          month,
          year
        })
      }).then(resp => {
        if (resp.ok) {
          commit(types.SET_CUSTOMER, {
            ...state.customer,
            birth_day: day,
            birthday_month: month,
            birthday_year: year
          })
          resolve(resp)
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  getCustomers ({}, {last_seen_at = null, page = 0, per_page = 20}): Promise<Customer[]> {
    let url = processURLAddress(config.swell.endpoint) + `/customers/all?page=${page}&per_page=${per_page}${last_seen_at ? `&last_seen_at=${last_seen_at}` : ''}`
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Customer[]>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        if (resp.ok) {
          resp.json().then(json => {
            const customers: Customer[] = json.result

            if (customers && customers.length) {
              resolve(customers)
            } else {
              reject(json)
            }
          })
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  getCustomer ({ commit }, {email = null, id = null, with_referral_code = false, with_history = false}): Promise<Customer> {
    if (!email && !id) {
      throw new Error('Email or ID is required.')
    }

    let url = processURLAddress(config.swell.endpoint) + `/customers?customer_id=${id}&customer_email=${email}${with_referral_code ? '&with_referral_code=true' : ''}${with_history ? '&with_history=true' : ''}`
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Customer>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        if (resp.ok) {
          resp.json().then(json => {
            const customer: Customer = json.result

            if (customer) {
              commit(types.SET_CUSTOMER, customer)
              resolve(customer)
            } else {
              reject(json)
            }
          })
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  createRedemption ({ state }, redemptionOptionId): Promise<Redemption> {
    if (!state.customerId && (!state.customer || !state.customer.email)) {
      throw new Error('Identified customer required.')
    }

    let url = processURLAddress(config.swell.endpoint) + '/redemptions'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Redemption>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ 
          customer_external_id: state.customerId,
          customer_email: state.customer ? state.customer.email : null,
          redemption_option_id: redemptionOptionId
        })
      }).then(resp => {
        if (resp.ok) {
          resp.json().then(json => {
            const redemption: Redemption = json.result

            if (redemption) {
              resolve(redemption)
            } else {
              reject(json)
            }
          })
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  fetchActiveRedemptionOptions ({ commit }): Promise<RedemptionOption[]> {
    let url = processURLAddress(config.swell.endpoint) + '/redemption_options'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<RedemptionOption[]>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        if (resp.ok) {
          resp.json().then(json => {
            const options: RedemptionOption[] = json.result

            if (options && options.length) {
              commit(types.SET_REDEMPTION_OPTIONS, options)
              resolve(options)
            } else {
              reject(json)
            }
          })
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  getRedemptionCodeData ({}, { third_party_id = null, code = null }): Promise<RedemptionCode> {
    if (!third_party_id && !code) {
      throw new Error('Redemption ID or Code is required.')
    }

    let url = processURLAddress(config.swell.endpoint) + '/redemption_codes'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<RedemptionCode>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        if (resp.ok) {
          resp.json().then(json => {
            const code: RedemptionCode = json.result

            if (code) {
              resolve(code)
            } else {
              reject(json)
            }
          })
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  getActiveCampaigns ({ state, commit }, with_status = false): Promise<Campaign[]> {
    let url = processURLAddress(config.swell.endpoint) + `/campaigns${with_status ? '?with_status=true' : ''}`

    if (with_status) {
      if (!state.customerId && (!state.customer || !state.customer.email)) {
        throw new Error('Identified customer required to get his current status and eligibility on each of the campaigns.')
      }
      url = `&customer_id=${state.customerId}&customer_email=${state.customer ? state.customer.email : ''}`
    }

    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Campaign[]>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        if (resp.ok) {
          resp.json().then(json => {
            const campaigns: Campaign[] = json.result

            if (campaigns && campaigns.length) {
              commit(types.SET_CAMPAIGNS, campaigns)
              resolve(campaigns)
            } else {
              reject(json)
            }
          })
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  createOrder ({ state }, order): Promise<Response> {
    if (!state.customer || !state.customer.email) {
      throw new Error('Identified customer required.')
    }

    if (!order.cart) {
      throw new Error('Order Cart is required.')
    }
    
    let url = processURLAddress(config.swell.endpoint) + '/orders'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    const storeView = currentStoreView()
    const currencyCode = storeView.i18n.currencyCode

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          customer_email: state.customer.email,
          total_amount_cents: order.cart.platformTotals.subtotal * 100,
          currency_code: currencyCode,
          order_id: order.id.toString(),
          status: 'paid',
          created_at: Math.round((new Date(order.created_at)).getTime()/1000),
          coupon_code: [].join(','),
          user_agent: navigator.userAgent,
          discount_amount_cents: order.cart.platformTotals.discount_amount * 100,
          items: order.products.map(product => ({
            id: product.id.toString(),
            name: product.name,
            quantity: product.qty,
            price_cents: product.price * 100,
            collections: [].join(','),
            type: product.type,
            vendor: ''
          }))
         })
      }).then(resp => {
        if (resp.ok) {
          resolve(resp)
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  createRefund ({}, order): Promise<Response> {
    if (!order.cart) {
      throw new Error('Order Cart is required.')
    }
    
    let url = processURLAddress(config.swell.endpoint) + '/refunds'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          id: '',
          order_id: order.id.toString(),
          total_amount_cents: order.cart.platformTotals.subtotal * 100,
          items: order.products.map(product => ({
            id: product.id.toString(),
            quantity: product.qty
          }))
         })
      }).then(resp => {
        if (resp.ok) {
          resolve(resp)
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
  fetchVipTiers ({ commit }): Promise<VipTier[]> {
    let url = processURLAddress(config.swell.endpoint) + '/vip_tiers'
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<VipTier[]>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        if (resp.ok) {
          resp.json().then(json => {
            const vipTiers: VipTier[] = json.result

            if (vipTiers && vipTiers.length) {
              commit(types.SET_VIP_TIERS, vipTiers)
              resolve(vipTiers)
            } else {
              reject(json)
            }
          })
        } else {
          reject(resp)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },
}

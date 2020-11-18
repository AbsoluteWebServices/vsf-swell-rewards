import { ActionTree } from 'vuex'
import config from 'config'
import fetch from 'isomorphic-fetch'
import { processURLAddress } from '@vue-storefront/core/helpers'
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore'
import RootState from '@vue-storefront/core/types/RootState'
import * as types from './mutation-types'
import SwellRewardsState from '../types/SwellRewardsState'
import Customer from '../types/Customer'
import Redemption from '../types/Redemption'
import RedemptionOption from '../types/RedemptionOption'
import RedemptionCode from '../types/RedemptionCode'
import Campaign from '../types/Campaign'
import VipTier from '../types/VipTier'
import { Logger } from '@vue-storefront/core/lib/logger'
import rootStore from '@vue-storefront/core/store'

const getUserToken = () => {
  const token = rootStore.getters['user/getUserToken']

  if (!token) {
    throw new Error('User token required')
  }
  return token
}

export const actions: ActionTree<SwellRewardsState, RootState> = {
  // V1 actions
  recordUserAction (context, { type = 'CustomAction' }): Promise<Response> {
    if (!config.swellRewards.apiUrl || !config.swellRewards.apiUrl.v1 || !config.swellRewards.merchantId) return

    let url = config.swellRewards.apiUrl.v1 + `/user_actions`

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-merchant-id': config.swellRewards.merchantId
        },
        mode: 'cors',
        body: JSON.stringify({
          type,
          merchant_id: config.swellRewards.merchantId
        })
      }).then(resp => {
        resp.json().then(json => {
          if (resp.ok) {
            resolve(json)
          } else {
            reject(json)
          }
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  getCustomerV1 ({ commit }, email): Promise<Customer> {
    if (!config.swellRewards.apiUrl || !config.swellRewards.apiUrl.v1 || !config.swellRewards.merchantId) return

    if (!email) {
      throw new Error('Email is required.')
    }

    let url = config.swellRewards.apiUrl.v1 + `/customer_details?merchant_id=${config.swellRewards.merchantId}&customer_email=${encodeURIComponent(email)}`

    return new Promise<Customer>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        resp.json().then(json => {
          if (resp.ok) {
            const customer: Customer = json.result

            if (customer) {
              commit(types.UPDATE_CUSTOMER, customer)
              resolve(customer)
            } else {
              reject(json)
            }
          } else {
            reject(json)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  // V2 actions
  recordAction (context, { action_name, type = 'CustomAction', created_at = (new Date()).toISOString(), reward_points = undefined, history_title = undefined }): Promise<Response> {
    const token = getUserToken()
    let url = processURLAddress(config.swellRewards.endpoint) + `/actions?token=${token}`

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
  updateCustomer ({ commit }, {firstname, lastname, pos_account_id = null, tags = []}): Promise<Response> {
    const token = getUserToken()
    let url = processURLAddress(config.swellRewards.endpoint) + `/customers?token=${token}`

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
          first_name: firstname,
          last_name: lastname,
          pos_account_id,
          tags: tags.join(',')
        })
      }).then(resp => {
        if (resp.ok) {
          commit(types.UPDATE_CUSTOMER, {
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
  setCustomerBirthday ({ commit }, {day, month, year}): Promise<Response> {
    const token = getUserToken()
    let url = processURLAddress(config.swellRewards.endpoint) + `/customer_birthdays?token=${token}`

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
          day,
          month,
          year
        })
      }).then(resp => {
        if (resp.ok) {
          commit(types.UPDATE_CUSTOMER, {
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
  getCustomers (context, {last_seen_at = null, page = 0, per_page = 20} = {}): Promise<Customer[]> {
    let url = processURLAddress(config.swellRewards.endpoint) + `/customers/all?page=${page}&per_page=${per_page}${last_seen_at ? `&last_seen_at=${last_seen_at}` : ''}`

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
        resp.json().then(json => {
          if (resp.ok) {
            const customers: Customer[] = json.result.customers

            if (customers && customers.length) {
              resolve(customers)
            } else {
              reject(json)
            }
          } else {
            reject(json)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  getCustomerV2 ({ commit }, {with_referral_code = false, with_history = false}): Promise<Customer> {
    const token = getUserToken()
    let url = processURLAddress(config.swellRewards.endpoint) + `/customers?token=${token}${with_referral_code ? '&with_referral_code=true' : ''}${with_history ? '&with_history=true' : ''}`

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
        resp.json().then(json => {
          if (resp.ok) {
            const customer: Customer = json.result

            if (customer) {
              commit(types.UPDATE_CUSTOMER, {...customer, referrer: customer.referral_code})
              resolve(customer)
            } else {
              reject(json)
            }
          } else {
            reject(json)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  refreshCustomer ({ dispatch }, { with_referral_code = false, with_history = false } = {}): Promise<Customer> {
    return dispatch('getCustomerV2', { with_referral_code, with_history })
  },
  sendReferralEmails ({ state }, emails): Promise<Response> {
    if (!state.customer || !state.customer.email) {
      throw new Error('Identified customer required.')
    }

    let url = processURLAddress(config.swellRewards.endpoint) + `/referral_email_shares`
    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emails,
          customer_email: state.customer.email
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
  createRedemption (context, {redemptionOptionId, delay_points_deduction = false}): Promise<Redemption> {
    if (!redemptionOptionId) {
      throw new Error('Redemption option ID required.')
    }

    const token = getUserToken()
    let url = processURLAddress(config.swellRewards.endpoint) + `/redemptions?token=${token}`

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
          redemption_option_id: redemptionOptionId,
          delay_points_deduction
        })
      }).then(resp => {
        resp.json().then(json => {
          if (resp.ok) {
            const redemption: Redemption = json.result

            if (redemption) {
              this.commit(types.SET_ACTIVE_REDEMPTION, redemption)
              resolve(redemption)
            } else {
              reject(json)
            }
          } else {
            reject(json)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  setActiveRedemption ({ commit }, redemption: Redemption): boolean {
    if (redemption.approved) {
      commit(types.SET_ACTIVE_REDEMPTION, redemption)
      return true
    }
    return false
  },
  removeActiveRedemption ({ state, commit }) {
    if (state.activeRedemption) {
      commit(types.SET_ACTIVE_REDEMPTION, null)
    }
  },
  fetchActiveRedemptionOptions ({ commit }): Promise<RedemptionOption[]> {
    let url = processURLAddress(config.swellRewards.endpoint) + '/redemption_options'

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
        resp.json().then(json => {
          if (resp.ok) {
            const options: RedemptionOption[] = json.result

            if (options && options.length) {
              commit(types.SET_REDEMPTION_OPTIONS, options)
              resolve(options)
            } else {
              reject(json)
            }
          } else {
            reject(resp)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  getRedemptionCodeData (context, { third_party_id = null, code = null }): Promise<RedemptionCode | null> {
    if (!third_party_id && !code) {
      throw new Error('Redemption ID or Code is required.')
    }

    let url = processURLAddress(config.swellRewards.endpoint) + `/redemption_codes?${third_party_id ? `third_party_id=${third_party_id}` + (code ? '&' : '') : ''}${code ? `code=${encodeURIComponent(code)}` : ''}`

    if (config.storeViews.multistore) {
      url = adjustMultistoreApiUrl(url)
    }

    return new Promise<RedemptionCode | null>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        resp.json().then(json => {
          if (resp.ok) {
            const code: RedemptionCode = json.result[0]

            if (code) {
              resolve(code)
            } else {
              reject(json)
            }
          } else {
            reject(resp)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  checkCoupon ({ state, dispatch }, code): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      dispatch('getRedemptionCodeData', { code }).then(codeData => {
        if (codeData) {
          if (!!state.customer && !!state.customer.email) {
            resolve(codeData.email === state.customer.email)
          } else {
            resolve(false)
          }
        } else {
          resolve(true)
        }
      }).catch(err => {
        Logger.error(err)()
        resolve(true)
      })
    })
  },
  getActiveCampaigns ({ state, commit }, with_status = false): Promise<Campaign[]> {
    let url = processURLAddress(config.swellRewards.endpoint) + '/campaigns'

    if (with_status) {
      const token = getUserToken()

      url = `?with_status=true&token=${token}`
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
        resp.json().then(json => {
          if (resp.ok) {
            const campaigns: Campaign[] = json.result

            if (campaigns && campaigns.length) {
              commit(types.SET_CAMPAIGNS, campaigns)
              resolve(campaigns)
            } else {
              reject(json)
            }
          } else {
            reject(resp)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  fetchVipTiers ({ commit }): Promise<VipTier[]> {
    let url = processURLAddress(config.swellRewards.endpoint) + '/vip_tiers'

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
        resp.json().then(json => {
          if (resp.ok) {
            const vipTiers: VipTier[] = json.result

            if (vipTiers && vipTiers.length) {
              commit(types.SET_VIP_TIERS, vipTiers)
              resolve(vipTiers)
            } else {
              reject(json)
            }
          } else {
            reject(resp)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  }
}

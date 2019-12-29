import { apiStatus } from '../../../lib/util'
import { Router } from 'express'

module.exports = ({ config, db }) => {
  let swellApi = Router()

  /**
   * V1
   */
  /**
   * Identify Referrer
   *
   * This method takes an email address as a string to identify the email to attribute referred emails to.
   * This is useful if you are building a custom referral program experience in which logged out customers can still participate.
   */
  swellApi.get('/customer_details', (req, res) => {
    if (!req.query.customer_email) {
      apiStatus(res, 'Customer Email required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v1 + '/customer_details',
      method: 'GET',
      qs: {
        customer_email: req.query.customer_email,
        merchant_id: config.extensions.swellRewards.merchantId
      }
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  /**
   * Send Referral Emails
   *
   * This method takes an array of email addresses to send the referral email share email to.
   * This is useful if you are building a custom referral program experience and want your customer to be able to share his referral link with his or her friends via email.
   */
  swellApi.post('/referral_email_shares', (req, res) => {
    let data = req.body

    if (!data.customer_email) {
      apiStatus(res, 'Customer Email is required.', 400)
      return
    }

    console.log(data)

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v1 + '/referral_email_shares',
      method: 'POST',
      json: true,
      body: {
        emails: data.emails,
        customer_email: data.customer_email,
        merchant_id: config.extensions.swellRewards.merchantId
      }
    }, (error, response, body) => {
      console.log(error)
      if (error) {
        apiStatus(res, error, 500)
      } else {
        apiStatus(res, body, response.statusCode)
      }
    })
  })

  /**
   * V2
   */
  /**
   * Record a Customer Action
   *
   * This endpoint records an action performed by a customer.
   * It will apply the action to all matching active campaigns and award the necessary points and/or discounts.
   */
  swellApi.post('/actions', (req, res) => {
    let data = req.body

    if (!data.customer_email) {
      apiStatus(res, 'Customer Email is required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/actions',
      method: 'POST',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      json: true,
      body: Object.assign({}, data, {ip_address: req.ip})
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  /**
   * Create/Update Customer Records
   *
   * This endpoint both creates and updates a customer’s record in the Swell system.
   * Use this primarily to notify Swell when you add a customer manually in your admin,
   * or a customer changes their email address.
   */
  swellApi.post('/customers', (req, res) => {
    let data = req.body

    if (!data.id && !data.email) {
      apiStatus(res, 'Customer Id or Email required.', 400)
      return
    }

    if (!data.first_name) {
      apiStatus(res, 'First name is required.', 400)
      return
    }

    if (!data.last_name) {
      apiStatus(res, 'Last name is required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/customers',
      method: 'POST',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      json: true,
      body: data
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        apiStatus(res, body, response.statusCode)
      }
    })
  })

  /**
   * Set Customer Birthday
   */
  swellApi.post('/customer_birthdays', (req, res) => {
    let data = req.body

    if (!data.customer_email) {
      apiStatus(res, 'Customer Email is required.', 400)
      return
    }

    if (!data.day || !data.month || !data.year) {
      apiStatus(res, 'Date is required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/customer_birthdays',
      method: 'POST',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      json: true,
      body: data
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        apiStatus(res, body, response.statusCode)
      }
    })
  })

  /**
   * Fetch All Customers
   *
   * Fetches a list of customers and customer data registered in the Yotpo Loyalty database.
   * Use the last_seen_at parameter to retrieve active customers since a specific date (YYYY-MM-DD).
   */
  swellApi.get('/customers/all', (req, res) => {
    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/customers/all',
      method: 'GET',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      qs: req.query
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  /**
   * Fetch Customer Details
   *
   * This endpoint returns a Swell customer record.
   * Most commonly used to fetch a customer’s point balance and unique referral link.
   */
  swellApi.get('/customers', (req, res) => {
    if (!req.query.customer_id && !req.query.customer_email) {
      apiStatus(res, 'Customer Id or Email required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/customers',
      method: 'GET',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      qs: req.query
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  /**
   * Create Redemption
   *
   * This endpoint will redeem a customer’s points for a particular redemption option.
   * It will check to ensure the customer is eligible and has enough points
   * for the selected redemption option and then it will deduct the points from their balance,
   * generate the coupon code, and return it in the response.
   */
  swellApi.post('/redemptions', (req, res) => {
    let data = req.body

    if (!data.customer_external_id && !data.customer_email) {
      apiStatus(res, 'Customer Id or Email required.', 400)
      return
    }

    if (!data.redemption_option_id) {
      apiStatus(res, 'Redemption option ID is required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/redemptions',
      method: 'POST',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      json: true,
      body: data
    }, (error, response, body) => {
      console.log(body.status)
      console.log(response.statusCode)
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  /**
   * Fetch Active Redemption Options
   *
   * This endpoint returns a list of redemption options available for customers to redeem.
   */
  swellApi.get('/redemption_options', (req, res) => {
    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/redemption_options',
      method: 'GET',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      }
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  /**
   * Get Redemption Code Data
   *
   * This endpoint lets you fetch the email address of a customer who redeemed a discount
   * by providing a third party_id or the discount code.
   * This enables merchants to validate (at checkout) if the shopper placing the order
   * is different than the shopper who redeemed and used the discount.
   */
  swellApi.get('/redemption_codes', (req, res) => {
    if (!req.query.third_party_id && !req.query.code) {
      apiStatus(res, 'Third-party Id or Code required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/redemption_codes',
      method: 'GET',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      qs: req.query
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  /**
   * Get Active Campaigns
   *
   * This endpoint returns a list of campaigns available for customers to participate in.
   * If you provide a particular customer we can return their current status and eligibility on each of the campaigns.
   */
  swellApi.get('/campaigns', (req, res) => {
    if (req.query.with_status) {
      if (!req.query.customer_id && !req.query.customer_email) {
        apiStatus(res, 'Customer Id or Email required.', 400)
        return
      }
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/campaigns',
      method: 'GET',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      qs: req.query
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  /**
   * Create Order
   *
   * This endpoint records an order made by a customer.
   * It will apply the order to all matching active campaigns and award the necessary points and/or discounts.
   */
  swellApi.post('/orders', (req, res) => {
    let data = req.body

    if (!data.customer_email) {
      apiStatus(res, 'Customer Email is required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/orders',
      method: 'POST',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      json: true,
      body: Object.assign({}, data, {ip_address: req.ip})
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        apiStatus(res, body, response.statusCode)
      }
    })
  })

  /**
   * Create Refund
   *
   * Send a new refund to the Swell API to adjust previously processed order.
   * Requests are processed asynchronously.
   */
  swellApi.post('/refunds', (req, res) => {
    let data = req.body

    if (!data.order_id) {
      apiStatus(res, 'Order ID is required.', 400)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/refunds',
      method: 'POST',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      },
      json: true,
      body: data
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        apiStatus(res, body, response.statusCode)
      }
    })
  })

  /**
   * Fetch VIP Tiers
   */
  swellApi.get('/vip_tiers', (req, res) => {
    let request = require('request')
    request({
      url: config.extensions.swellRewards.apiUrl.v2 + '/vip_tiers',
      method: 'GET',
      headers: {
        'x-guid': config.extensions.swellRewards.guid,
        'x-api-key': config.extensions.swellRewards.apiKey
      }
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        let json = body
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        apiStatus(res, json, response.statusCode)
      }
    })
  })

  return swellApi
}

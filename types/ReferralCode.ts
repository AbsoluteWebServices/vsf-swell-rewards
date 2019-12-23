import Referral from './Referral'

export default interface ReferralCode {
  code: string
  shares: number
  facebook_shares: number
  twitter_shares: number
  email_shares: number
  emails_sent: number
  emails_viewed: number
  links_clicked_from_email: number
  links_clicked_from_twitter: number
  links_clicked_from_facebook: number
  orders: number
  amount_cents: number
  average_amount_cents: number
  expires_at: null
  expired: false
  completed_referral_customers: Referral[]
  email: string
  unique_clicks: number
  total_clicks: number
}
import ReferralCode from './ReferralCode'
import ActionHistoryItem from './ActionHistoryItem'
import VipTierStats from './VipTierStats'
import VipTierRequirements from './VipTierRequirements'
import Referral from './Referral'
import Redemption from './Redemption'

export default interface Customer {
  total_spend_cents: number,
  total_purchases: number,
  perks_redeemed: number,
  last_purchase_at?: Date,
  email: string,
  points_earned: number,
  points_balance: number,
  points_expire_at?: Date,
  first_name: string,
  last_name: string,
  last_seen_at: Date,
  thirty_party_id: string,
  third_party_id: string,
  pos_account_id?: string,
  has_store_account: boolean,
  referrer?: ReferralCode,
  referral_code?: string,
  referral_receipts?: Referral[],
  history_items?: ActionHistoryItem[],
  birthday_month?: number,
  birth_day?: number,
  birthday_year?: number,
  vip_tier_name?: string,
  vip_tier_entry_date?: Date,
  vip_tier_expiration?: Date,
  vip_tier_actions_completed?: VipTierStats,
  vip_tier_maintenance_requirements?: VipTierRequirements,
  vip_tier_upgrade_requirements?: VipTierRequirements,
  point_redemptions?: Redemption[]
}

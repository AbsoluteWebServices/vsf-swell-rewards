import Customer from './Customer'
import RedemptionOption from './RedemptionOption'
import VipTier from './VipTier'
import Campaign from './Campaign'

export default interface SwellRewardsState {
  customerId: string
  customer: Customer
  redemptionOptions: RedemptionOption[]
  campaigns: Campaign[]
  vipTiers: VipTier[]
}

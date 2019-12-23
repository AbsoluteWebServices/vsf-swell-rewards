import VipTierStats from './VipTierStats'

export default interface VipTier {
  id: number
  name: string
  description: string
  points_multiplier: number
  entry_threshold: VipTierStats
  retain_threshold: VipTierStats
  regain_threshold: VipTierStats
}
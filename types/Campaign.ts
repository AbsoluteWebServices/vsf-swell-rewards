export default interface Campaign {
  id: number
  title: string
  details: string
  type: string
  cta_text?: string
  share_text?: string
  url?: string
  username?: string
  entity_id?: string
  icon: string
  reward_text: string
  expires_at?: Date
  created_at: Date
  updated_at: Date
  max_completions_per_user?: number
  min_actions_required: number
  hashtags?: string
  question?: string
  display_order: number
  default_email_body: string
  action_name?: string
  ask_year: boolean
}
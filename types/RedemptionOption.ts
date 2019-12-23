export default interface RedemptionOption {
  id: number
  name: string
  description: string
  icon: string
  cost_text: string
  amount: number
  applies_to_product_type: string
  duration: string
}
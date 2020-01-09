export default interface RedemptionOption {
  id: number,
  name: string,
  type: string,
  description: string,
  icon: string,
  cost_text: string,
  amount: number,
  applies_to_product_type: string,
  duration: string,
  discount_type?: string,
  discount_amount_cents?: number,
  discount_percentage?: number,
  discount_rate_cents?: number
}

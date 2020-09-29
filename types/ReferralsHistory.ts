export default interface ReferralsHistory {
  completed_at: Date | null,
  customer_id: number,
  email: string,
  id: number,
  merchant_id: number,
  referral_code_id: number,
  reminder_job_id: number | string | null,
  signed_up_at: Date | null,
  source: 'string',
  source_host: string | null
}

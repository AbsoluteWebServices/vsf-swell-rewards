export default interface Referral {
  id: number,
  referral_code_id: number,
  customer_id: number,
  signed_up_at: Date,
  completed_at: Date,
  email: string,
  source: string,
  source_host: string,
  reminder_job_id: string
}

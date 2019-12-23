export default interface ActionHistoryItem {
  action: string
  created_at: Date
  date: Date
  points: number
  credits?: string
  status: 'Approved' | 'Pending' | 'Reversed' | string
}
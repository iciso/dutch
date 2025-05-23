export type MemberID = "Im" | "Fe" | "Fo" | "Ay"

export interface Expense {
  id: string
  date: string
  description: string
  amount: number
  paidBy: MemberID
  sharedBy: MemberID[]
}

export interface Member {
  id: MemberID
  name: string
  totalContributed: number
  balance: number // Positive: is owed, Negative: owes
}

export interface Settlement {
  from: MemberID
  to: MemberID
  amount: number
}

import type { Expense, Member, Settlement } from "@/types"

export const MEMBERS: Member[] = [
  { id: "Im", name: "Imthiaz", totalContributed: 0, balance: 0 },
  { id: "Fe", name: "Feroza", totalContributed: 0, balance: 0 },
  { id: "Fo", name: "Fouzya", totalContributed: 0, balance: 0 },
  { id: "Ay", name: "Ayesha", totalContributed: 0, balance: 0 },
]

export function calculateMemberStats(expenses: Expense[]): Member[] {
  // Create a copy of the members array
  const members = MEMBERS.map((member) => ({ ...member, totalContributed: 0, balance: 0 }))

  // Calculate total expenses and contributions
  let totalExpenses = 0

  // Calculate each member's contribution
  expenses.forEach((expense) => {
    const paidByMember = members.find((m) => m.id === expense.paidBy)
    if (paidByMember) {
      paidByMember.totalContributed += expense.amount
    }

    totalExpenses += expense.amount
  })

  // Calculate ideal equal share
  const idealShare = totalExpenses / members.length

  // Calculate balance for each member
  members.forEach((member) => {
    member.balance = member.totalContributed - idealShare
  })

  return members
}

export function calculateSettlements(members: Member[]): Settlement[] {
  // Create deep copies to avoid modifying the original data
  const debtors = members
    .filter((m) => m.balance < 0)
    .map((m) => ({ ...m, balance: Math.abs(m.balance) }))
    .sort((a, b) => b.balance - a.balance)

  const creditors = members
    .filter((m) => m.balance > 0)
    .map((m) => ({ ...m }))
    .sort((a, b) => b.balance - a.balance)

  const settlements: Settlement[] = []

  // Calculate minimal transactions
  debtors.forEach((debtor) => {
    let remainingDebt = debtor.balance

    while (remainingDebt > 0 && creditors.length > 0) {
      const creditor = creditors[0]

      // Calculate the transaction amount
      const amount = Math.min(remainingDebt, creditor.balance)

      // Round to 2 decimal places
      const roundedAmount = Math.round(amount * 100) / 100

      if (roundedAmount > 0) {
        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: roundedAmount,
        })
      }

      // Update remaining amounts
      remainingDebt -= amount
      creditor.balance -= amount

      // Remove creditor if fully paid
      if (creditor.balance < 0.01) {
        creditors.shift()
      }
    }
  })

  return settlements
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

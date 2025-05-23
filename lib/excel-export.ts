import * as XLSX from "xlsx"
import type { Expense, Member } from "@/types"
import { calculateSettlements, MEMBERS } from "./expense-utils"
import { format } from "date-fns"

export function exportToExcel(expenses: Expense[], members: Member[]) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Expenses List
  const expensesData = expenses.map((expense) => ({
    Date: format(new Date(expense.date), "dd/MM/yyyy"),
    Description: expense.description,
    Amount: expense.amount,
    "Paid By": MEMBERS.find((m) => m.id === expense.paidBy)?.name || expense.paidBy,
    "Shared By": expense.sharedBy.map((id) => MEMBERS.find((m) => m.id === id)?.name || id).join(", "),
    "Amount Per Person": Math.round((expense.amount / expense.sharedBy.length) * 100) / 100,
  }))

  const expensesSheet = XLSX.utils.json_to_sheet(expensesData)

  // Auto-size columns for expenses sheet
  const expensesColWidths = [
    { wch: 12 }, // Date
    { wch: 30 }, // Description
    { wch: 12 }, // Amount
    { wch: 15 }, // Paid By
    { wch: 25 }, // Shared By
    { wch: 18 }, // Amount Per Person
  ]
  expensesSheet["!cols"] = expensesColWidths

  XLSX.utils.book_append_sheet(workbook, expensesSheet, "Expenses")

  // Sheet 2: Member Summary
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const idealShare = totalExpenses / members.length

  const memberSummaryData = members.map((member) => ({
    "Member Name": member.name,
    "Total Contributed": member.totalContributed,
    "Ideal Share": Math.round(idealShare * 100) / 100,
    Balance: Math.round(member.balance * 100) / 100,
    Status: member.balance > 0 ? "Is Owed" : member.balance < 0 ? "Owes" : "Settled",
    Amount: Math.abs(Math.round(member.balance * 100) / 100),
  }))

  // Add totals row
  memberSummaryData.push({
    "Member Name": "TOTAL",
    "Total Contributed": totalExpenses,
    "Ideal Share": totalExpenses,
    Balance: 0,
    Status: "",
    Amount: 0,
  })

  const memberSheet = XLSX.utils.json_to_sheet(memberSummaryData)

  // Auto-size columns for member sheet
  const memberColWidths = [
    { wch: 15 }, // Member Name
    { wch: 18 }, // Total Contributed
    { wch: 15 }, // Ideal Share
    { wch: 12 }, // Balance
    { wch: 12 }, // Status
    { wch: 12 }, // Amount
  ]
  memberSheet["!cols"] = memberColWidths

  XLSX.utils.book_append_sheet(workbook, memberSheet, "Member Summary")

  // Sheet 3: Settlement Plan
  const settlements = calculateSettlements(members)

  if (settlements.length > 0) {
    const settlementData = settlements.map((settlement, index) => ({
      "Transaction #": index + 1,
      From: MEMBERS.find((m) => m.id === settlement.from)?.name || settlement.from,
      To: MEMBERS.find((m) => m.id === settlement.to)?.name || settlement.to,
      Amount: settlement.amount,
      Status: "Pending",
    }))

    const settlementSheet = XLSX.utils.json_to_sheet(settlementData)

    // Auto-size columns for settlement sheet
    const settlementColWidths = [
      { wch: 15 }, // Transaction #
      { wch: 15 }, // From
      { wch: 15 }, // To
      { wch: 12 }, // Amount
      { wch: 12 }, // Status
    ]
    settlementSheet["!cols"] = settlementColWidths

    XLSX.utils.book_append_sheet(workbook, settlementSheet, "Settlement Plan")
  } else {
    // Create an empty settlement sheet with a message
    const emptySettlementData = [{ Message: "All expenses are settled! No transactions needed." }]
    const emptySettlementSheet = XLSX.utils.json_to_sheet(emptySettlementData)
    XLSX.utils.book_append_sheet(workbook, emptySettlementSheet, "Settlement Plan")
  }

  // Sheet 4: Expense Statistics
  const memberExpenseStats = MEMBERS.map((member) => {
    const memberExpenses = expenses.filter((expense) => expense.paidBy === member.id)
    const totalPaid = memberExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const expenseCount = memberExpenses.length
    const avgExpense = expenseCount > 0 ? totalPaid / expenseCount : 0

    return {
      "Member Name": member.name,
      "Expenses Paid": expenseCount,
      "Total Amount Paid": totalPaid,
      "Average Expense": Math.round(avgExpense * 100) / 100,
      "Percentage of Total": totalExpenses > 0 ? Math.round((totalPaid / totalExpenses) * 100 * 100) / 100 : 0,
    }
  })

  const statsSheet = XLSX.utils.json_to_sheet(memberExpenseStats)

  // Auto-size columns for stats sheet
  const statsColWidths = [
    { wch: 15 }, // Member Name
    { wch: 15 }, // Expenses Paid
    { wch: 18 }, // Total Amount Paid
    { wch: 16 }, // Average Expense
    { wch: 18 }, // Percentage of Total
  ]
  statsSheet["!cols"] = statsColWidths

  XLSX.utils.book_append_sheet(workbook, statsSheet, "Statistics")

  // Generate filename with current date
  const currentDate = format(new Date(), "yyyy-MM-dd")
  const filename = `Family_Expenses_${currentDate}.xlsx`

  // Write and download the file
  XLSX.writeFile(workbook, filename)
}

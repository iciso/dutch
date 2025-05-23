"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Expense, Member } from "@/types"
import { formatCurrency } from "@/lib/expense-utils"
import { exportToExcel } from "@/lib/excel-export"
import { Button } from "@/components/ui/button"

interface DashboardSummaryProps {
  expenses: Expense[]
  members: Member[]
}

export function DashboardSummary({ expenses, members }: DashboardSummaryProps) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const idealShare = totalExpenses / members.length

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Expense Summary</CardTitle>
        <CardDescription>Overview of all family expenses and contributions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">Ideal share: {formatCurrency(idealShare)} per member</p>
            </CardContent>
          </Card>

          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{member.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(member.totalContributed)}</div>
                <p
                  className={`text-xs font-medium ${
                    member.balance > 0
                      ? "text-green-600"
                      : member.balance < 0
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {member.balance > 0
                    ? `Is owed: ${formatCurrency(member.balance)}`
                    : member.balance < 0
                      ? `Owes: ${formatCurrency(Math.abs(member.balance))}`
                      : "Settled"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => exportToExcel(expenses, members)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Excel Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

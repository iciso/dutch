"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Member } from "@/types"
import { calculateSettlements, formatCurrency } from "@/lib/expense-utils"
import { exportToExcel } from "@/lib/excel-export"
import type { Expense } from "@/types"

interface SettlementCalculatorProps {
  members: Member[]
  expenses: Expense[]
}

export function SettlementCalculator({ members, expenses }: SettlementCalculatorProps) {
  const [open, setOpen] = useState(false)
  const settlements = calculateSettlements(members)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement Calculator</CardTitle>
        <CardDescription>Calculate the minimal transactions needed to settle expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div key={member.id} className="p-4 border rounded-lg flex flex-col">
              <div className="text-lg font-medium">{member.name}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total Contributed: {formatCurrency(member.totalContributed)}
              </div>
              <div
                className={`mt-1 text-sm font-medium ${
                  member.balance > 0 ? "text-green-600" : member.balance < 0 ? "text-red-600" : ""
                }`}
              >
                {member.balance > 0
                  ? `Is owed: ${formatCurrency(member.balance)}`
                  : member.balance < 0
                    ? `Owes: ${formatCurrency(Math.abs(member.balance))}`
                    : "Settled"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1">Calculate Settlements</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Settlement Plan</DialogTitle>
              <DialogDescription>The minimal transactions needed to settle all expenses</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {settlements.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">All expenses are already settled!</div>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="font-medium">{members.find((m) => m.id === settlement.from)?.name}</div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-green-600 font-medium">{formatCurrency(settlement.amount)}</span>
                      </div>
                      <div className="font-medium">{members.find((m) => m.id === settlement.to)?.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Button onClick={() => exportToExcel(expenses, members)} variant="outline" className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Excel
        </Button>
      </CardFooter>
    </Card>
  )
}

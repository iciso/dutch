"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, CarIcon as CaretSortIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Expense } from "@/types"
import { formatCurrency } from "@/lib/expense-utils"
import { format } from "date-fns"

interface ExpenseListProps {
  expenses: Expense[]
  onDeleteExpense: (id: string) => void
}

type SortField = "date" | "amount" | "description" | "paidBy"
type SortDirection = "asc" | "desc"

export function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "amount":
        comparison = a.amount - b.amount
        break
      case "description":
        comparison = a.description.localeCompare(b.description)
        break
      case "paidBy":
        comparison = a.paidBy.localeCompare(b.paidBy)
        break
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense History</CardTitle>
        <CardDescription>View and manage all recorded expenses</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No expenses recorded yet. Add your first expense using the form.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                    >
                      Date
                      {sortField === "date" ? (
                        sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <CaretSortIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("description")}
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                    >
                      Description
                      {sortField === "description" ? (
                        sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <CaretSortIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("amount")}
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                    >
                      Amount
                      {sortField === "amount" ? (
                        sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <CaretSortIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("paidBy")}
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                    >
                      Paid By
                      {sortField === "paidBy" ? (
                        sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <CaretSortIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Shared By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>Member {expense.paidBy}</TableCell>
                    <TableCell>{expense.sharedBy.map((id) => `Member ${id}`).join(", ")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onDeleteExpense(expense.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

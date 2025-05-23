"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { SettlementCalculator } from "@/components/settlement-calculator"
import { DashboardSummary } from "@/components/dashboard-summary"
import type { Expense } from "@/types"
import { calculateMemberStats } from "@/lib/expense-utils"

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])

  // Load expenses from localStorage on initial render
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses")
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses))
      } catch (error) {
        console.error("Failed to parse saved expenses:", error)
      }
    }
  }, [])

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses))
  }, [expenses])

  const members = calculateMemberStats(expenses)

  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [...prev, expense])
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Go Dutch</h1>
        <p className="text-muted-foreground mt-1">Family Expense Sharing App</p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <DashboardSummary expenses={expenses} members={members} />
          <div className="grid md:grid-cols-2 gap-6">
            <ExpenseForm onAddExpense={handleAddExpense} />
            <SettlementCalculator members={members} expenses={expenses} />
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ExpenseForm onAddExpense={handleAddExpense} />
            </div>
            <div className="md:col-span-2">
              <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settlement" className="space-y-6 mt-6">
          <div className="grid gap-6">
            <DashboardSummary expenses={expenses} members={members} />
            <SettlementCalculator members={members} expenses={expenses} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}

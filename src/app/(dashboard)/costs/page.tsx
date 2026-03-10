'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import ExpenseForm from '@/components/costs/ExpenseForm'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Loader2, Receipt } from 'lucide-react'
import type { Expense } from '@/types'

export default function CostsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
    setExpenses((data as Expense[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  async function handleDelete(id: string) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    setConfirmDeleteId(null)
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Cost Control"
        subtitle={`€ ${total.toFixed(2)} across ${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={() => { setEditingExpense(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        }
      />

      <div className="p-4 md:p-8 space-y-6">
        {/* Summary card */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Receipt className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total moving expenses</p>
            <p className="text-2xl font-bold text-slate-900">€ {total.toFixed(2)}</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💶</div>
            <p className="text-slate-500 font-medium">No expenses logged yet</p>
            <button
              onClick={() => { setEditingExpense(null); setShowForm(true) }}
              className="mt-4 btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log your first expense
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{expense.description}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                        € {Number(expense.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <button
                            onClick={() => { setEditingExpense(expense); setShowForm(true) }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {confirmDeleteId === expense.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(expense.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-slate-700">Total</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">€ {total.toFixed(2)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="card flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{expense.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(expense.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-900">€ {Number(expense.amount).toFixed(2)}</span>
                    <button
                      onClick={() => { setEditingExpense(expense); setShowForm(true) }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === expense.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(expense.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="card flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Total</span>
                <span className="text-sm font-bold text-slate-900">€ {total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => { setShowForm(false); setEditingExpense(null) }}
          onSaved={fetchExpenses}
        />
      )}
    </div>
  )
}

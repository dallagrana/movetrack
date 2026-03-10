'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Expense, ExpenseFormData } from '@/types'

interface ExpenseFormProps {
  expense?: Expense | null
  onClose: () => void
  onSaved: () => void
}

const today = new Date().toISOString().slice(0, 10)

const DEFAULT_FORM: ExpenseFormData = {
  date: today,
  description: '',
  amount: '',
}

export default function ExpenseForm({ expense, onClose, onSaved }: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseFormData>(
    expense
      ? {
          date: expense.date.slice(0, 10),
          description: expense.description,
          amount: String(expense.amount),
        }
      : DEFAULT_FORM
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount) return
    const parsed = parseFloat(form.amount)
    if (isNaN(parsed) || parsed < 0) {
      setError('Please enter a valid amount.')
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createClient()

    const payload = {
      date: form.date,
      description: form.description.trim(),
      amount: parsed,
    }

    let err
    if (expense) {
      ;({ error: err } = await supabase.from('expenses').update(payload).eq('id', expense.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      ;({ error: err } = await supabase.from('expenses').insert({ ...payload, user_id: user?.id }))
    }

    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      onSaved()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {expense ? 'Edit Expense' : 'New Expense'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="label">Date *</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Description *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Removal company deposit"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Amount (€) *</label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : expense ? (
                'Save Changes'
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

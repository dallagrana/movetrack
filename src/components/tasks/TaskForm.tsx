'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Category, TaskFormData } from '@/types'

interface TaskFormProps {
  task?: Task | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

const DEFAULT_FORM: TaskFormData = {
  title: '',
  description: '',
  category_id: null,
  status: 'pending',
  priority: 'medium',
  start_date: '',
  end_date: '',
  is_essential: false,
}

export default function TaskForm({ task, categories, onClose, onSaved }: TaskFormProps) {
  const [form, setForm] = useState<TaskFormData>(
    task
      ? {
          title: task.title,
          description: task.description ?? '',
          category_id: task.category_id,
          status: task.status,
          priority: task.priority,
          start_date: task.start_date ? task.start_date.slice(0, 10) : '',
          end_date: task.end_date ? task.end_date.slice(0, 10) : '',
          is_essential: task.is_essential,
        }
      : DEFAULT_FORM
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const payload = {
      title: form.title,
      description: form.description || null,
      category_id: form.category_id,
      status: form.status,
      priority: form.priority,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_essential: form.is_essential,
    }

    let error
    if (task) {
      ;({ error } = await supabase.from('tasks').update(payload).eq('id', task.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      ;({ error } = await supabase.from('tasks').insert({ ...payload, user_id: user?.id }))
    }

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      onSaved()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {task ? 'Edit Task' : 'New Task'}
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
            <label className="label">Task Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Call utility providers"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Optional details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category_id ?? ''}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskFormData['priority'] })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(['pending', 'in_progress', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                    form.status === s
                      ? s === 'completed'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : s === 'in_progress'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-slate-200 border-slate-400 text-slate-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-blue-600"
              checked={form.is_essential}
              onChange={(e) => setForm({ ...form, is_essential: e.target.checked })}
            />
            <span className="text-sm font-medium text-slate-700">Essential task (must complete before moving)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

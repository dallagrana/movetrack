'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import TaskCard from '@/components/tasks/TaskCard'
import TaskForm from '@/components/tasks/TaskForm'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Filter, Loader2 } from 'lucide-react'
import type { Task, Category } from '@/types'

const STATUS_OPTIONS = ['all', 'pending', 'in_progress', 'completed'] as const
const PRIORITY_OPTIONS = ['all', 'high', 'medium', 'low'] as const

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_OPTIONS[number]>('all')
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<typeof PRIORITY_OPTIONS[number]>('all')

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: taskData }, { data: catData }] = await Promise.all([
      supabase.from('tasks').select('*, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('id'),
    ])
    setTasks((taskData as Task[]) ?? [])
    setCategories((catData as Category[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleDelete(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleStatusChange(id: string, status: Task['status']) {
    await supabase.from('tasks').update({ status }).eq('id', id)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const completedCount = tasks.filter((t) => t.status === 'completed').length

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Task Manager"
        subtitle={`${completedCount} of ${tasks.length} tasks completed`}
        actions={
          <button
            onClick={() => { setEditingTask(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        }
      />

      <div className="p-4 md:p-8 space-y-6">
        {/* Filters */}
        <div className="card py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />

              {/* Status filter */}
              <select
                className="input py-1.5 text-sm w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              {/* Category filter */}
              <select
                className="input py-1.5 text-sm w-auto"
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Priority filter */}
              <select
                className="input py-1.5 text-sm w-auto"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-500 font-medium">
              {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            </p>
            {tasks.length === 0 && (
              <button
                onClick={() => { setEditingTask(null); setShowForm(true) }}
                className="mt-4 btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categories={categories}
                onEdit={(t) => { setEditingTask(t); setShowForm(true) }}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          categories={categories}
          onClose={() => { setShowForm(false); setEditingTask(null) }}
          onSaved={fetchData}
        />
      )}
    </div>
  )
}

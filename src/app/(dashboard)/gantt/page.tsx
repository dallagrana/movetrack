'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import GanttChart from '@/components/visualizations/GanttChart'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import type { Task, Category } from '@/types'

export default function GanttPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('tasks').select('*, categories(*)').order('start_date', { ascending: true }),
      supabase.from('categories').select('*').order('id'),
    ]).then(([{ data: taskData }, { data: catData }]) => {
      setTasks((taskData as Task[]) ?? [])
      setCategories((catData as Category[]) ?? [])
      setLoading(false)
    })
  }, [])

  const withDates = tasks.filter((t) => t.start_date || t.end_date)

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Gantt Timeline"
        subtitle={`${withDates.length} tasks plotted on timeline`}
      />

      <div className="p-4 md:p-8">
        <p className="md:hidden text-center text-sm text-slate-500 py-4 px-4">
          Rotate your device or open on a larger screen for the best Gantt experience.
        </p>
        <div className="card p-0 overflow-hidden">
          {/* Info bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {categories.map((cat) => {
                const colors: Record<string, string> = {
                  Utilities: '#3B82F6',
                  Packing: '#F59E0B',
                  Legal: '#8B5CF6',
                  Moving: '#10B981',
                  Administrative: '#6B7280',
                }
                const color = colors[cat.name] ?? '#6B7280'
                return (
                  <div key={cat.id} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                    <span className="text-sm text-slate-600">{cat.name}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-slate-400">Scroll horizontally to see full timeline</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <GanttChart tasks={tasks} categories={categories} />
          )}
        </div>
      </div>
    </div>
  )
}

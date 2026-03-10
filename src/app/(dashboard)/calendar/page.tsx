'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import type { Task } from '@/types'

// Dynamically import to avoid SSR issues with react-big-calendar
const CalendarView = dynamic(
  () => import('@/components/visualizations/CalendarView'),
  { ssr: false, loading: () => <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> }
)

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('tasks')
      .select('*, categories(*)')
      .then(({ data }) => {
        setTasks((data as Task[]) ?? [])
        setLoading(false)
      })
  }, [])

  const withDates = tasks.filter((t) => t.start_date || t.end_date)

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Calendar View"
        subtitle={`${withDates.length} tasks with dates scheduled`}
      />

      <div className="p-4 md:p-8">
        {/* Legend */}
        <div className="card mb-6 py-3">
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { label: 'Utilities', color: '#3B82F6' },
              { label: 'Packing', color: '#F59E0B' },
              { label: 'Legal', color: '#8B5CF6' },
              { label: 'Moving', color: '#10B981' },
              { label: 'Administrative', color: '#6B7280' },
              { label: 'Completed', color: '#10B981', opacity: 0.6 },
            ].map(({ label, color, opacity }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color, opacity: opacity ?? 1 }}
                />
                <span className="text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <CalendarView tasks={tasks} />
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { getCategoryColor } from '@/lib/utils'
import type { Task } from '@/types'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Task
}

interface CalendarViewProps {
  tasks: Task[]
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())
  const [selected, setSelected] = useState<Task | null>(null)

  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter((t) => t.start_date || t.end_date)
      .map((t) => {
        const start = t.start_date ? new Date(t.start_date) : new Date(t.end_date!)
        const end = t.end_date ? new Date(t.end_date) : new Date(t.start_date!)
        // Ensure end >= start
        const safeEnd = end < start ? start : end
        return { id: t.id, title: t.title, start, end: safeEnd, resource: t }
      })
  }, [tasks])

  function eventStyleGetter(event: CalendarEvent) {
    const color = getCategoryColor(event.resource.categories?.name)
    const isDone = event.resource.status === 'completed'
    return {
      style: {
        backgroundColor: isDone ? '#10B981' : color,
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
        fontWeight: 500,
        opacity: isDone ? 0.7 : 1,
      },
    }
  }

  return (
    <div className="relative">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onSelectEvent={(e: CalendarEvent) => setSelected(selected?.id === e.id ? null : e.resource)}
        eventPropGetter={eventStyleGetter}
        style={{ height: 600 }}
        popup
        tooltipAccessor={(e: CalendarEvent) =>
          `${e.title} — ${e.resource.categories?.name ?? 'Uncategorized'} (${e.resource.status})`
        }
      />

      {/* Event detail panel */}
      {selected && (
        <div className="absolute top-4 right-4 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-10 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: getCategoryColor(selected.categories?.name) }}
            />
            <button
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1">{selected.title}</h3>
          {selected.description && (
            <p className="text-xs text-slate-500 mb-3">{selected.description}</p>
          )}
          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Category</span>
              <span className="font-medium text-slate-700">{selected.categories?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-medium text-slate-700 capitalize">{selected.status.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Priority</span>
              <span className="font-medium text-slate-700 capitalize">{selected.priority}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

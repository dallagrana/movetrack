'use client'

import { useMemo, useRef } from 'react'
import { format, addDays, differenceInDays, parseISO, startOfDay, isValid } from 'date-fns'
import { getCategoryColor } from '@/lib/utils'
import type { Task, Category } from '@/types'

interface GanttChartProps {
  tasks: Task[]
  categories: Category[]
}

const ROW_HEIGHT = 44
const HEADER_HEIGHT = 56
const LABEL_WIDTH = 200
const PX_PER_DAY = 36
const MIN_BAR_WIDTH = 10

export default function GanttChart({ tasks, categories }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Only tasks with at least start or end date
  const validTasks = tasks.filter((t) => t.start_date || t.end_date)

  const { minDate, maxDate, totalDays, dateColumns, groupedTasks } = useMemo(() => {
    if (validTasks.length === 0) {
      const today = startOfDay(new Date())
      return {
        minDate: today,
        maxDate: addDays(today, 30),
        totalDays: 30,
        dateColumns: [] as Date[],
        groupedTasks: [] as { category: Category | null; tasks: Task[] }[],
      }
    }

    const dates = validTasks.flatMap((t) => {
      const d: Date[] = []
      if (t.start_date) {
        const parsed = parseISO(t.start_date)
        if (isValid(parsed)) d.push(startOfDay(parsed))
      }
      if (t.end_date) {
        const parsed = parseISO(t.end_date)
        if (isValid(parsed)) d.push(startOfDay(parsed))
      }
      return d
    })

    const min = addDays(new Date(Math.min(...dates.map((d) => d.getTime()))), -2)
    const max = addDays(new Date(Math.max(...dates.map((d) => d.getTime()))), 4)
    const total = Math.max(differenceInDays(max, min), 14)

    const cols: Date[] = []
    for (let i = 0; i <= total; i++) {
      cols.push(addDays(min, i))
    }

    // Group by category
    const catMap = new Map<number | null, Task[]>()
    catMap.set(null, [])
    categories.forEach((c) => catMap.set(c.id, []))

    validTasks.forEach((t) => {
      const key = t.category_id ?? null
      if (!catMap.has(key)) catMap.set(key, [])
      catMap.get(key)!.push(t)
    })

    const grouped: { category: Category | null; tasks: Task[] }[] = []
    categories.forEach((cat) => {
      const catTasks = catMap.get(cat.id)
      if (catTasks && catTasks.length > 0) {
        grouped.push({ category: cat, tasks: catTasks })
      }
    })
    const uncategorized = catMap.get(null)
    if (uncategorized && uncategorized.length > 0) {
      grouped.push({ category: null, tasks: uncategorized })
    }

    return { minDate: min, maxDate: max, totalDays: total, dateColumns: cols, groupedTasks: grouped }
  }, [validTasks, categories])

  const today = startOfDay(new Date())
  const todayOffset = differenceInDays(today, minDate)
  const todayLeft = LABEL_WIDTH + todayOffset * PX_PER_DAY

  function getBarStyle(task: Task) {
    const start = task.start_date ? startOfDay(parseISO(task.start_date)) : today
    const end = task.end_date ? startOfDay(parseISO(task.end_date)) : start

    const offsetDays = differenceInDays(start, minDate)
    const durationDays = Math.max(differenceInDays(end, start), 0)
    const left = LABEL_WIDTH + offsetDays * PX_PER_DAY
    const width = Math.max(durationDays * PX_PER_DAY, MIN_BAR_WIDTH)
    const color = getCategoryColor(task.categories?.name)
    const isDone = task.status === 'completed'

    return { left, width, color: isDone ? '#10B981' : color, opacity: isDone ? 0.6 : 1 }
  }

  const totalWidth = LABEL_WIDTH + (totalDays + 1) * PX_PER_DAY

  if (validTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="text-5xl mb-4">📊</div>
        <p className="font-medium">No tasks with dates to display</p>
        <p className="text-sm mt-1">Add start and end dates to your tasks to see them here.</p>
      </div>
    )
  }

  // Week labels: group columns by week
  const weekLabels: { label: string; span: number }[] = []
  let currentWeek = ''
  let span = 0
  dateColumns.forEach((d) => {
    const wk = format(d, 'MMM d')
    if (format(d, 'w-yyyy') !== currentWeek) {
      if (span > 0) weekLabels.push({ label: currentWeek, span })
      currentWeek = format(d, 'w-yyyy')
      span = 1
    } else {
      span++
    }
  })
  if (span > 0) weekLabels.push({ label: currentWeek, span })

  return (
    <div className="overflow-x-auto" ref={containerRef}>
      <div style={{ minWidth: totalWidth }} className="relative select-none">
        {/* Header */}
        <div
          className="sticky top-0 z-10 bg-white border-b border-slate-200"
          style={{ height: HEADER_HEIGHT }}
        >
          {/* Week row */}
          <div className="flex" style={{ height: HEADER_HEIGHT / 2 }}>
            <div
              style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}
              className="flex-shrink-0 border-r border-slate-200 px-3 flex items-center"
            >
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</span>
            </div>
            {dateColumns.filter((_, i) => i % 7 === 0).map((d) => (
              <div
                key={d.toISOString()}
                style={{ width: PX_PER_DAY * 7 }}
                className="flex-shrink-0 px-2 border-r border-slate-100 flex items-center"
              >
                <span className="text-xs font-medium text-slate-500">{format(d, 'MMM d')}</span>
              </div>
            ))}
          </div>

          {/* Day row */}
          <div className="flex" style={{ height: HEADER_HEIGHT / 2 }}>
            <div style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }} className="flex-shrink-0 border-r border-slate-200" />
            {dateColumns.map((d) => {
              const isToday = differenceInDays(d, today) === 0
              const isWeekend = [0, 6].includes(d.getDay())
              return (
                <div
                  key={d.toISOString()}
                  style={{ width: PX_PER_DAY }}
                  className={`flex-shrink-0 flex items-center justify-center border-r border-slate-100 ${
                    isToday ? 'bg-blue-50' : isWeekend ? 'bg-slate-50' : ''
                  }`}
                >
                  <span
                    className={`text-xs ${
                      isToday ? 'text-blue-600 font-bold' : isWeekend ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {format(d, 'd')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="relative">
          {/* Today line */}
          {todayOffset >= 0 && todayOffset <= totalDays && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-20 pointer-events-none"
              style={{ left: todayLeft }}
            />
          )}

          {/* Grid columns */}
          <div className="absolute inset-0 flex pointer-events-none">
            <div style={{ width: LABEL_WIDTH }} className="flex-shrink-0" />
            {dateColumns.map((d) => {
              const isWeekend = [0, 6].includes(d.getDay())
              return (
                <div
                  key={d.toISOString()}
                  style={{ width: PX_PER_DAY }}
                  className={`flex-shrink-0 border-r border-slate-100 h-full ${
                    isWeekend ? 'bg-slate-50/50' : ''
                  }`}
                />
              )
            })}
          </div>

          {/* Category groups */}
          {groupedTasks.map(({ category, tasks: catTasks }) => (
            <div key={category?.id ?? 'none'}>
              {/* Group header */}
              <div
                className="flex items-center border-b border-slate-100 bg-slate-50"
                style={{ height: 36 }}
              >
                <div
                  style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}
                  className="flex-shrink-0 px-3 flex items-center gap-2 border-r border-slate-200"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: getCategoryColor(category?.name) }}
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    {category?.name ?? 'Uncategorized'}
                  </span>
                </div>
                <div className="flex-1" />
              </div>

              {/* Task rows */}
              {catTasks.map((task) => {
                const bar = getBarStyle(task)
                return (
                  <div
                    key={task.id}
                    className="flex items-center border-b border-slate-100 hover:bg-blue-50/30 transition-colors relative"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {/* Label */}
                    <div
                      style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}
                      className="flex-shrink-0 px-3 flex items-center gap-2 border-r border-slate-200"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            task.priority === 'high'
                              ? '#EF4444'
                              : task.priority === 'medium'
                              ? '#F59E0B'
                              : '#10B981',
                        }}
                      />
                      <span className="text-xs text-slate-700 truncate">{task.title}</span>
                    </div>

                    {/* Bar */}
                    <div className="relative flex-1 h-full">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 overflow-hidden group/bar cursor-default"
                        style={{
                          left: bar.left - LABEL_WIDTH,
                          width: bar.width,
                          height: 24,
                          backgroundColor: bar.color,
                          opacity: bar.opacity,
                        }}
                        title={`${task.title}\n${task.start_date?.slice(0, 10) ?? '?'} → ${task.end_date?.slice(0, 10) ?? '?'}\nStatus: ${task.status}`}
                      >
                        {bar.width > 60 && (
                          <span className="text-white text-xs font-medium truncate">
                            {task.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 px-4 flex flex-wrap gap-4 pb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-blue-400" />
            <span className="text-xs text-slate-500">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
            <span className="text-xs text-slate-500">High priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span className="text-xs text-slate-500">Medium priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-xs text-slate-500">Completed / Low priority</span>
          </div>
        </div>
      </div>
    </div>
  )
}

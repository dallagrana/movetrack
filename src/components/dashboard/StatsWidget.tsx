import { getCategoryColor } from '@/lib/utils'
import type { Task, Category } from '@/types'

interface StatsWidgetProps {
  tasks: Task[]
  categories: Category[]
}

export default function StatsWidget({ tasks, categories }: StatsWidgetProps) {
  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed')
  const overdue = tasks.filter((t) => {
    if (!t.end_date || t.status === 'completed') return false
    return new Date(t.end_date) < new Date()
  })

  const byCategory = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category_id === cat.id)
    const done = catTasks.filter((t) => t.status === 'completed').length
    return { ...cat, total: catTasks.length, done }
  }).filter((c) => c.total > 0)

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(overdue.length > 0 || highPriority.length > 0) && (
        <div className="card border-l-4 border-red-400 bg-red-50 py-4">
          <h3 className="font-semibold text-red-800 mb-2">Needs Attention</h3>
          <div className="space-y-1">
            {overdue.length > 0 && (
              <p className="text-sm text-red-700">⚠️ {overdue.length} overdue task{overdue.length > 1 ? 's' : ''}</p>
            )}
            {highPriority.length > 0 && (
              <p className="text-sm text-red-700">🔴 {highPriority.length} high-priority task{highPriority.length > 1 ? 's' : ''} pending</p>
            )}
          </div>
        </div>
      )}

      {/* By Category */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">By Category</h3>
        {byCategory.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No tasks yet</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map((cat) => {
              const pct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0
              const color = getCategoryColor(cat.name)
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                    <span className="text-xs text-slate-400">{cat.done}/{cat.total}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

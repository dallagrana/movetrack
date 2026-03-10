import { CheckCircle2, Circle, Clock } from 'lucide-react'
import type { Task } from '@/types'

interface ProgressWidgetProps {
  tasks: Task[]
}

export default function ProgressWidget({ tasks }: ProgressWidgetProps) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Overall Progress</h3>
          <p className="text-sm text-slate-500">{total} tasks total</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-blue-600">{percent}%</span>
          <p className="text-xs text-slate-400">complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-emerald-50 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-emerald-700">{completed}</div>
          <div className="text-xs text-emerald-600">Done</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-blue-700">{inProgress}</div>
          <div className="text-xs text-blue-600">In Progress</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <Circle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-700">{pending}</div>
          <div className="text-xs text-slate-500">Pending</div>
        </div>
      </div>
    </div>
  )
}

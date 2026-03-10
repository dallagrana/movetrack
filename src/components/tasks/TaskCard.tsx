'use client'

import { useState } from 'react'
import { Edit2, Trash2, Star, Calendar, CheckCircle2, Clock, Circle } from 'lucide-react'
import { formatDate, getCategoryColor } from '@/lib/utils'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types'
import type { Task, Category } from '@/types'

interface TaskCardProps {
  task: Task
  categories: Category[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Task['status']) => void
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const statusCfg = STATUS_CONFIG[task.status]
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const categoryColor = getCategoryColor(task.categories?.name)

  const StatusIcon =
    task.status === 'completed'
      ? CheckCircle2
      : task.status === 'in_progress'
      ? Clock
      : Circle

  const isOverdue =
    task.end_date &&
    task.status !== 'completed' &&
    new Date(task.end_date) < new Date()

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md group ${
        isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status toggle */}
          <button
            onClick={() => {
              const next: Task['status'] =
                task.status === 'pending'
                  ? 'in_progress'
                  : task.status === 'in_progress'
                  ? 'completed'
                  : 'pending'
              onStatusChange(task.id, next)
            }}
            className="mt-0.5 flex-shrink-0"
            title="Toggle status"
          >
            <StatusIcon
              className={`w-5 h-5 transition-colors ${
                task.status === 'completed'
                  ? 'text-emerald-500'
                  : task.status === 'in_progress'
                  ? 'text-blue-500'
                  : 'text-slate-300 hover:text-slate-400'
              }`}
            />
          </button>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold ${
                  task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              >
                {task.title}
              </span>
              {task.is_essential && (
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
              )}
              {isOverdue && (
                <span className="badge bg-red-100 text-red-600 text-xs">Overdue</span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {task.categories && (
                <span
                  className="badge text-white text-xs font-medium"
                  style={{ backgroundColor: categoryColor }}
                >
                  {task.categories.name}
                </span>
              )}
              <span className={`badge ${statusCfg.bg} ${statusCfg.text} text-xs`}>
                {statusCfg.label}
              </span>
              <span className={`badge ${priorityCfg.bg} ${priorityCfg.text} text-xs`}>
                {priorityCfg.label}
              </span>
              {task.end_date && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.end_date)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 flex-shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(task.id)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

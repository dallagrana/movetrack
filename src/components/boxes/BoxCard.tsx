'use client'

import { useState } from 'react'
import { Edit2, Trash2, Package } from 'lucide-react'
import { ROOMS, ROOM_COLORS } from '@/types'
import type { Box } from '@/types'

interface BoxCardProps {
  box: Box
  onEdit: (box: Box) => void
  onDelete: (id: string) => void
}

export default function BoxCard({ box, onEdit, onDelete }: BoxCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const roomLabel = ROOMS.find((r) => r.key === box.room_name)?.label ?? box.room_name
  const color = ROOM_COLORS[box.room_name] ?? '#94A3B8'

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200 group">
      <div className="p-4 space-y-3">
        {/* Box ID badge + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              <Package className="w-3.5 h-3.5" />
              {box.box_id}
            </div>
            {box.is_fragile && (
              <span className="badge bg-amber-100 text-amber-700 text-xs font-medium">
                ⚠ Fragile
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 flex-shrink-0">
            <button
              onClick={() => onEdit(box)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(box.id)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs bg-slate-100 text-slate600 rounded-lg hover:bg-slate-200 transition-colors"
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

        {/* Room label */}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{roomLabel}</p>

        {/* Contents */}
        {box.contents ? (
          <div>
            <p
              className={`text-sm text-slate-700 cursor-pointer ${expanded ? '' : 'line-clamp-2'}`}
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? 'Click to collapse' : 'Click to expand'}
            >
              {box.contents}
            </p>
            {!expanded && box.contents.length > 80 && (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs text-blue-500 hover:text-blue-700 mt-0.5"
              >
                Show more
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No contents listed</p>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { X, Loader2, Wand2, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROOMS, ROOM_CODE } from '@/types'
import type { Box, BoxFormData, RoomKey } from '@/types'

interface BoxFormProps {
  box?: Box | null
  onClose: () => void
  onSaved: () => void
}

const DEFAULT_FORM: BoxFormData = {
  room_key: 'bedroom',
  contents: '',
  is_fragile: false,
}

export default function BoxForm({ box, onClose, onSaved }: BoxFormProps) {
  const [form, setForm] = useState<BoxFormData>(
    box
      ? {
          room_key: box.room_name as RoomKey,
          contents: box.contents ?? '',
          is_fragile: box.is_fragile,
        }
      : DEFAULT_FORM
  )
  const [manualId, setManualId] = useState(false)
  const [customBoxId, setCustomBoxId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (box) {
      // Edit: only contents and is_fragile are mutable
      const { error: err } = await supabase
        .from('inventory')
        .update({ contents: form.contents || null, is_fragile: form.is_fragile })
        .eq('id', box.id)
      setLoading(false)
      if (err) { setError(err.message); return }
    } else {
      const { data: { user } } = await supabase.auth.getUser()

      let boxId: string
      let boxNumber: number | null

      if (manualId) {
        const trimmed = customBoxId.trim()
        if (!trimmed) { setError('Please enter a box ID.'); setLoading(false); return }
        boxId = trimmed
        boxNumber = null  // manual IDs are outside the auto sequence
      } else {
        // Global sequence — max across ALL rooms so numbers never repeat
        const { data: existing } = await supabase
          .from('inventory')
          .select('box_number')
          .eq('user_id', user?.id)
          .not('box_number', 'is', null)
          .order('box_number', { ascending: false })
          .limit(1)

        boxNumber = existing && existing.length > 0 && existing[0].box_number != null
          ? existing[0].box_number + 1
          : 1
        const code = ROOM_CODE[form.room_key]
        boxId = `${code}-${String(boxNumber).padStart(2, '0')}`
      }

      const { error: err } = await supabase.from('inventory').insert({
        user_id: user?.id,
        box_id: boxId,
        box_number: boxNumber,
        room_name: form.room_key,
        contents: form.contents || null,
        is_fragile: form.is_fragile,
      })
      setLoading(false)
      if (err) { setError(err.message); return }
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {box ? `Edit Box — ${box.box_id}` : 'New Box'}
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

          {box ? (
            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              Room and box ID are fixed once created.{' '}
              <span className="font-semibold text-slate-800">{box.box_id}</span>
            </div>
          ) : (
            <>
              {/* Room */}
              <div>
                <label className="label">Room *</label>
                <select
                  className="input"
                  value={form.room_key}
                  onChange={(e) => setForm({ ...form, room_key: e.target.value as RoomKey })}
                  required
                >
                  {ROOMS.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Box ID mode toggle */}
              <div>
                <label className="label">Box ID</label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm mb-3">
                  <button
                    type="button"
                    onClick={() => setManualId(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 transition-colors ${
                      !manualId
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-generate
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualId(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 transition-colors ${
                      manualId
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    Manual
                  </button>
                </div>

                {manualId ? (
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. GARAGE-TOOLS or MIX-01"
                    value={customBoxId}
                    onChange={(e) => setCustomBoxId(e.target.value)}
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                    Will be assigned as{' '}
                    <span className="font-semibold text-slate-700">
                      {ROOM_CODE[form.room_key]}-##
                    </span>{' '}
                    (next global number)
                  </div>
                )}
              </div>
            </>
          )}

          {/* Contents */}
          <div>
            <label className="label">Contents</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="e.g. Books, winter clothes, photo albums..."
              value={form.contents}
              onChange={(e) => setForm({ ...form, contents: e.target.value })}
            />
          </div>

          {/* Fragile */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-amber-500"
              checked={form.is_fragile}
              onChange={(e) => setForm({ ...form, is_fragile: e.target.checked })}
            />
            <span className="text-sm font-medium text-slate-700">Fragile contents — handle with care</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : box ? (
                'Save Changes'
              ) : (
                'Create Box'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Edit2, Check, X } from 'lucide-react'
import { daysUntil, countdownLabel, formatDate } from '@/lib/utils'
import { updateProfile } from '@/app/actions/auth'
import type { Profile } from '@/types'

export default function CountdownWidget({ profile }: { profile: Profile | null }) {
  const [days, setDays] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDays(daysUntil(profile?.target_move_date))
  }, [profile?.target_move_date])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    await updateProfile(formData)
    setSaving(false)
    setEditing(false)
  }

  const urgencyColor =
    days === null
      ? 'from-slate-700 to-slate-800'
      : days <= 7
      ? 'from-red-600 to-red-700'
      : days <= 30
      ? 'from-amber-500 to-orange-600'
      : 'from-blue-600 to-blue-700'

  return (
    <div className={`bg-gradient-to-br ${urgencyColor} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider">Relocation Countdown</p>
          <div className="mt-2">
            {days !== null ? (
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black tabular-nums">{Math.abs(days)}</span>
                <span className="text-xl font-medium mb-2 text-white/80">days</span>
              </div>
            ) : (
              <span className="text-2xl font-bold mt-1 block">Set your move date →</span>
            )}
          </div>
          <p className="text-white/80 font-medium text-sm mt-1">{countdownLabel(days)}</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="mt-4 space-y-3 bg-white/10 rounded-xl p-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Move Date</label>
            <input
              name="target_move_date"
              type="date"
              defaultValue={profile?.target_move_date ?? ''}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">From</label>
            <input
              name="origin_address"
              type="text"
              defaultValue={profile?.origin_address ?? ''}
              placeholder="Current city"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">To</label>
            <input
              name="destination_address"
              type="text"
              defaultValue={profile?.destination_address ?? ''}
              placeholder="New city"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <input type="hidden" name="full_name" value={profile?.full_name ?? ''} />
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-white text-blue-700 font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-white/90 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-1.5">
          {profile?.target_move_date && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(profile.target_move_date)}</span>
            </div>
          )}
          {(profile?.origin_address || profile?.destination_address) && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {profile?.origin_address ?? '?'} → {profile?.destination_address ?? '?'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

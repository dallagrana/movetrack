'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import BoxForm from '@/components/boxes/BoxForm'
import BoxCard from '@/components/boxes/BoxCard'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Loader2, Package } from 'lucide-react'
import { ROOMS } from '@/types'
import type { Box } from '@/types'

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBox, setEditingBox] = useState<Box | null>(null)
  const [search, setSearch] = useState('')
  const [roomFilter, setRoomFilter] = useState<string>('all')

  const supabase = createClient()

  const fetchBoxes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .not('box_id', 'is', null)
      .order('room_name', { ascending: true })
      .order('box_number', { ascending: true })
    setBoxes((data as Box[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchBoxes()
  }, [fetchBoxes])

  async function handleDelete(id: string) {
    await supabase.from('inventory').delete().eq('id', id)
    setBoxes((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = boxes.filter((b) => {
    if (roomFilter !== 'all' && b.room_name !== roomFilter) return false
    if (search && !b.contents?.toLowerCase().includes(search.toLowerCase()) && !b.box_id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Box Tracker"
        subtitle={`${boxes.length} box${boxes.length !== 1 ? 'es' : ''} total`}
        actions={
          <button
            onClick={() => { setEditingBox(null); setShowForm(true) }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Box
          </button>
        }
      />

      <div className="p-4 md:p-8 space-y-6">
        {/* Summary */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total boxes packed</p>
            <p className="text-2xl font-bold text-slate-900">{boxes.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card py-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search box ID or contents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
            <select
              className="input py-1.5 text-sm w-auto"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="all">All Rooms</option>
              {ROOMS.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-slate-500 font-medium">
              {boxes.length === 0 ? 'No boxes created yet' : 'No boxes match your filters'}
            </p>
            {boxes.length === 0 && (
              <button
                onClick={() => { setEditingBox(null); setShowForm(true) }}
                className="mt-4 btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create your first box
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((box) => (
              <BoxCard
                key={box.id}
                box={box}
                onEdit={(b) => { setEditingBox(b); setShowForm(true) }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <BoxForm
          box={editingBox}
          onClose={() => { setShowForm(false); setEditingBox(null) }}
          onSaved={fetchBoxes}
        />
      )}
    </div>
  )
}

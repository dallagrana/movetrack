'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Calendar, GanttChart, LogOut, Truck, Receipt, Package, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useSidebar } from './SidebarContext'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/gantt', label: 'Gantt Chart', icon: GanttChart },
  { href: '/costs', label: 'Costs', icon: Receipt },
  { href: '/boxes', label: 'Boxes', icon: Package },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { open, close } = useSidebar()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Backdrop overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300',
          'md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-white text-lg">MoveTrack</span>
            <p className="text-slate-400 text-xs">Relocation Planner</p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
      </aside>
    </>
  )
}

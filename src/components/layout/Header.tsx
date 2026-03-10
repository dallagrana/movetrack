'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './SidebarContext'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  userName?: string | null
}

export default function Header({ title, subtitle, actions, userName }: HeaderProps) {
  const { toggle } = useSidebar()

  return (
    <header className="bg-white border-b border-slate-100 px-4 py-4 md:px-8 md:py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {actions}
        {userName && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{userName}</span>
          </div>
        )}
      </div>
    </header>
  )
}

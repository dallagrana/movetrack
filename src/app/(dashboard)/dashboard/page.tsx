import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import CountdownWidget from '@/components/dashboard/CountdownWidget'
import ProgressWidget from '@/components/dashboard/ProgressWidget'
import StatsWidget from '@/components/dashboard/StatsWidget'
import { formatDate } from '@/lib/utils'
import { CheckSquare, Calendar, GanttChart, ArrowRight, Receipt, Package } from 'lucide-react'
import Link from 'next/link'
import type { Task, Profile, Category } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: tasks },
    { data: categories },
    { data: expenses },
    { count: boxCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('tasks')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('id'),
    supabase.from('expenses').select('amount').eq('user_id', user.id),
    supabase
      .from('inventory')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('box_id', 'is', null),
  ])

  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0)

  const upcomingTasks = (tasks as Task[] | null)
    ?.filter((t) => t.status !== 'completed' && t.end_date)
    .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime())
    .slice(0, 5) ?? []

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Dashboard"
        subtitle={`Welcome back${profile?.full_name ? `, ${profile.full_name}` : ''}!`}
        userName={profile?.full_name}
      />

      <div className="p-4 md:p-8 space-y-8">
        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CountdownWidget profile={profile as Profile | null} />
          </div>
          <div className="lg:col-span-1">
            <ProgressWidget tasks={(tasks as Task[]) ?? []} />
          </div>
          <div className="lg:col-span-1">
            <StatsWidget
              tasks={(tasks as Task[]) ?? []}
              categories={(categories as Category[]) ?? []}
            />
          </div>
        </div>

        {/* Expense + Box summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/costs" className="card flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
              <Receipt className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500">Total moving expenses</p>
              <p className="text-2xl font-bold text-slate-900">€ {totalExpenses.toFixed(2)}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </Link>

          <Link href="/boxes" className="card flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500">Boxes in inventory</p>
              <p className="text-2xl font-bold text-slate-900">{boxCount ?? 0}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </Link>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/tasks', icon: CheckSquare, label: 'Manage Tasks', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', iconColor: 'text-blue-500' },
            { href: '/calendar', icon: Calendar, label: 'Calendar View', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', iconColor: 'text-purple-500' },
            { href: '/gantt', icon: GanttChart, label: 'Gantt Timeline', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', iconColor: 'text-emerald-500' },
          ].map(({ href, icon: Icon, label, color, iconColor }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between p-4 rounded-xl font-medium transition-colors ${color}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                {label}
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </Link>
          ))}
        </div>

        {/* Upcoming tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No upcoming tasks.</p>
              <Link href="/tasks" className="mt-2 inline-block text-sm text-blue-600 font-medium hover:underline">
                Add your first task →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="py-3 flex items-center gap-4">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        task.priority === 'high'
                          ? '#EF4444'
                          : task.priority === 'medium'
                          ? '#F59E0B'
                          : '#10B981',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">
                      {task.categories?.name ?? 'Uncategorized'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-slate-600">{formatDate(task.end_date)}</p>
                    <span
                      className={`badge text-xs ${
                        task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

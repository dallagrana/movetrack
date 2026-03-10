import Sidebar from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/components/layout/SidebarContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

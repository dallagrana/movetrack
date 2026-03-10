export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🚚</span>
            </div>
            <span className="text-2xl font-bold text-white">MoveTrack</span>
          </div>
          <p className="text-blue-200 text-sm">Your Relocation Command Center</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  )
}

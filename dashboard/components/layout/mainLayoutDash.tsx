interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Main content - full width */}
      <div className="py-10 relative min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
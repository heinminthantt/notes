import { Sidebar } from '@/components/docs/Sidebar'
import { MobileNav } from '@/components/docs/MobileNav'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile navigation */}
      <MobileNav />

      {/* Desktop layout */}
      <div className="lg:flex lg:min-h-screen">
        {/* Sidebar — fixed on desktop */}
        <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-r lg:border-[color:var(--border)] lg:bg-background z-20">
          <Sidebar />
        </div>

        {/* Main content */}
        <main
          className="lg:ml-60 flex-1 min-w-0"
          id="main-content"
        >
          {/* Inner scroll area */}
          <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-16 py-12 lg:py-16 mt-14 lg:mt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

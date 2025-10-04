"use client"
import { useParams } from 'next/navigation'
import { SidebarProvider } from '@/context/SidebarContext'
import Sidebar from '@/components/backoffice/Sidebar'
import DashboardNavbar from '@/components/backoffice/DashboardNavbar'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardLayout({ children, params }) {
  const { locale } = params

  return (
    <ProtectedRoute locale={locale}>
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardNavbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

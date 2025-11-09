"use client"
import { useParams } from 'next/navigation'
import { SidebarProvider } from '@/context/SidebarContext'
import Sidebar from '@/components/backoffice/Sidebar'
import DashboardNavbar from '@/components/backoffice/DashboardNavbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import Chatbot from '@/components/Chatbot'

export default function DashboardLayout({ children, params }) {
  const { locale } = params

  return (
    <ProtectedRoute locale={locale}>
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0 md:ml-0">
            <DashboardNavbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 scroll-smooth">
              {children}
            </main>
          </div>
          <Chatbot />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

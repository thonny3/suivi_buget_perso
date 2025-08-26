"use client"
import LoadingScreen from "@/components/LoadingScreen";
import DashboardNavbar from "@/components/backoffice/DashboardNavbar";
import Sidebar from "@/components/backoffice/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <ProtectedRoute>
      <div className="overflow-hidden h-auto"> {/* <-- Ajout h-screen */}
        <div className="flex overflow-y-hidden"> {/* <-- Empêche scroll vertical */}
          <Sidebar />
          <div className="w-full">
            <DashboardNavbar />
            <div className="overflow-y-hidden"> {/* <-- Désactive scroll sur le contenu */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

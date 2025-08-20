"use client"
import LoadingScreen from "@/components/LoadingScreen";
import DashboardNavbar from "@/components/backoffice/DashboardNavbar";
import Sidebar from "@/components/backoffice/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Loading effet au montage du composant
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // Réduit de 2s à 1s

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <ProtectedRoute>
      <div>
        <div className="flex">
          <Sidebar />
          <div className="w-full ">
            <DashboardNavbar />
            <div className="">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
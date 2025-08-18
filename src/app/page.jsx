"use client"
import Features from "@/components/frontOffice/landing/Features";
import Header from "@/components/frontOffice/landing/Header";
import Hero from "@/components/frontOffice/landing/Hero";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";

export default function Home() {
  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Header />
        <Hero />
        <Features />
      </div>
    </RedirectIfAuthenticated>
  );
}

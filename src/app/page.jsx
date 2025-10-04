"use client"
import Features from "@/components/frontOffice/landing/Features";
import Header from "@/components/frontOffice/landing/Header";
import Hero from "@/components/frontOffice/landing/Hero";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";
import { colors } from '@/styles/colors';

export default function Home() {
  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen" style={{ backgroundColor: colors.light }}>
        <Header />
        <Hero />
        <Features />
      </div>
    </RedirectIfAuthenticated>
  );
}

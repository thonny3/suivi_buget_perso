"use client"
import Features from "@/components/frontOffice/landing/Features";
import Header from "@/components/frontOffice/landing/Header";
import Hero from "@/components/frontOffice/landing/Hero";
import Footer from "@/components/frontOffice/landing/Footer";
import Pricing from "@/components/frontOffice/landing/Pricing";
import Testimonials from "@/components/frontOffice/landing/Testimonials";
import Security from "@/components/frontOffice/landing/Security";
import FAQ from "@/components/frontOffice/landing/FAQ";
import CTA from "@/components/frontOffice/landing/CTA";
import Contact from "@/components/frontOffice/landing/Contact";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";
import { colors } from '@/styles/colors';

export default function Home({ params }) {
  const { locale } = params

  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen" style={{ backgroundColor: colors.light }}>
        <Header />
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <Security />
        <FAQ />
        <Contact />
        <CTA />
        <Footer />
      </div>
    </RedirectIfAuthenticated>
  );
}

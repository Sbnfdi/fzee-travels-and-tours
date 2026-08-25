import { ModernPreloader } from '@/components/landing/preloader';
import { NavBar } from '@/components/landing/nav-bar';
import { Hero } from '@/components/landing/hero';
import { Stats } from '@/components/landing/stats';
import { Overview } from '@/components/landing/overview';
import { FlightsTable } from '@/components/landing/flights-table';
import { Features } from '@/components/landing/features';
import { Testimonials } from '@/components/landing/testimonials';
import { Partners } from '@/components/landing/partners';
import { Footer } from '@/components/landing/footer';
import { PromoPopup } from '@/components/landing/promo-popup';

export const revalidate = 60;

export default async function Page() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground font-sans">
      <ModernPreloader />
      <PromoPopup />
      <NavBar />
      <main className="flex-1 relative z-10 flex flex-col items-center w-full overflow-hidden">
        <Hero />
        <Overview />
        <FlightsTable />
        <Stats />
        <Features />
        <Testimonials />
        <Partners />
      </main>
      <Footer />
    </div>
  );
}

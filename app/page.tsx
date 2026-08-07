import { NavBar } from '@/components/landing/nav-bar';
import { Hero } from '@/components/landing/hero';
import { Stats } from '@/components/landing/stats';
import { Overview } from '@/components/landing/overview';
import { FlightsTable } from '@/components/landing/flights-table';
import { Features } from '@/components/landing/features';
import { Testimonials } from '@/components/landing/testimonials';
import { Partners } from '@/components/landing/partners';
import { Footer } from '@/components/landing/footer';

export const revalidate = 60;

export default async function Page() {
  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      {/* Global Video Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="https://cdn.pixabay.com/video/2016/09/21/5412-183786499_large.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay to ensure white text readability */}
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      <NavBar />
      <main className="flex-1 relative z-10 flex flex-col items-center w-full overflow-hidden">
        <Hero />
        <Stats />
        <Overview />
        <FlightsTable />
        <Features />
        <Testimonials />
        <Partners />
      </main>
      <Footer />
    </div>
  );
}

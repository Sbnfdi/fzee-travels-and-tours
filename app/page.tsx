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
    <div className="relative min-h-screen flex flex-col font-sans">
      {/* Global Video Background with Premium Mesh Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-950">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-lighten"
        >
          <source src="https://cdn.pixabay.com/video/2016/09/21/5412-183786499_large.mp4" type="video/mp4" />
        </video>
        
        {/* Modern Mesh Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-950/80 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
        
        {/* Dark overlay to ensure white text readability */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
      </div>

      <PromoPopup />
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

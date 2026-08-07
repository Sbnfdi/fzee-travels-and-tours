import { NavBar } from '@/components/landing/nav-bar';
import { Hero } from '@/components/landing/hero';
import { About } from '@/components/landing/about';
import { ServicesGlass } from '@/components/landing/services-glass';
import { Categories } from '@/components/landing/categories';
import { CeoSection } from '@/components/landing/ceo-section';
import { Features } from '@/components/landing/features';
import { Testimonials } from '@/components/landing/testimonials';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export default async function Page() {
  const [flights, groups, hotels, visas] = await Promise.all([
    prisma.flight.findMany({ where: { status: 'active' }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.group.findMany({ where: { status: 'open' }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.hotel.findMany({ take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.visaService.findMany({ where: { status: 'active' }, take: 8, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <Categories flights={flights} groups={groups} hotels={hotels} visas={visas} />
        <About />
        <ServicesGlass />
        <CeoSection />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

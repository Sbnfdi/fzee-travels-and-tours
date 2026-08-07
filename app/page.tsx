import { NavBar } from '@/components/landing/nav-bar';
import { Hero } from '@/components/landing/hero';
import { FlightsTable } from '@/components/landing/flights-table';
import { About } from '@/components/landing/about';
import { ServicesGlass } from '@/components/landing/services-glass';
import { CeoSection } from '@/components/landing/ceo-section';
import { Footer } from '@/components/landing/footer';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export default async function Page() {
  const [flights] = await Promise.all([
    prisma.flight.findMany({ where: { status: 'active' }, take: 8, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <FlightsTable flights={flights} />
        <About />
        <ServicesGlass />
        <CeoSection />
      </main>
      <Footer />
    </>
  );
}

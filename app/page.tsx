import { NavBar } from '@/components/landing/nav-bar';
import { Hero } from '@/components/landing/hero';
import { FlightsTable } from '@/components/landing/flights-table';
import { Partners } from '@/components/landing/partners';
import { Footer } from '@/components/landing/footer';

export const revalidate = 60;

export default async function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <FlightsTable />
        <Partners />
      </main>
      <Footer />
    </div>
  );
}

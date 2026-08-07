'use client';

export function CeoSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row items-center transition-transform duration-500 hover:-translate-y-2 hover:shadow-primary/5">
          
          {/* Image Side */}
          <div className="w-full md:w-2/5 md:self-stretch p-4 md:p-8 bg-gradient-to-br from-muted to-muted/50">
            <div className="w-full h-[400px] md:h-full relative rounded-[2rem] overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop" 
                alt="CEO" 
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-3/5 p-8 md:p-16">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6 relative inline-block">
              Message from the CEO
              <span className="absolute -bottom-2 left-0 w-16 h-1.5 bg-gradient-to-r from-primary to-primary/50 rounded-full"></span>
            </h2>
            
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed relative">
              {/* Decorative Quote Icon */}
              <div className="absolute -top-6 -left-6 text-6xl text-primary/10 font-serif leading-none select-none">"</div>
              
              <p className="relative z-10">
                At Fzee Travels & Tours, our mission has always been to redefine the B2B travel industry. We understand the challenges travel agencies face in sourcing competitive rates and managing complex group bookings.
              </p>
              <p className="relative z-10">
                That is why we built a platform focused on transparency, reliability, and innovation. We are committed to equipping our partners with the best tools and inventory to succeed in a dynamic market. Your growth is our success.
              </p>
            </div>

            <div className="mt-10 border-l-4 border-primary pl-6">
              <h4 className="text-xl font-bold text-foreground">Zeeshan Ikram Raja</h4>
              <p className="text-primary font-medium">Founder & CEO</p>
              
              {/* Optional Signature Graphic Placeholder */}
              <div className="mt-4 opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Signature_of_John_Hancock.svg" alt="Signature" className="h-10 dark:invert" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

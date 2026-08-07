'use client';

import Link from 'next/link';

export function Hero() {
  return (
    <section 
      className="relative pt-[140px] pb-[80px] px-4 min-h-auto bg-cover bg-center bg-fixed overflow-hidden"
      style={{ backgroundImage: "url('https://cdn.pixabay.com/photo/2023/03/11/11/34/travelling-7844283_960_720.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto text-center">
        <h1 
          className="text-[clamp(2rem,4vw,3rem)] font-[800] text-primary mb-[15px] tracking-tight" 
          style={{ textShadow: '2px 4px 12px rgba(0, 0, 0, 0.3)' }}
        >
          Welcome To Fzee Travels & Tours
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px] mt-[40px]">
          {[
            { title: "UAE Groups", desc: "Explore Dubai with group discounts", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop" },
            { title: "KSA Groups", desc: "Travel to Saudi Arabia with exclusive rates", img: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=600&auto=format&fit=crop" },
            { title: "Umrah Groups", desc: "Special packages for your spiritual journey", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop" },
            { title: "Muscat Groups", desc: "Discover the beauty of Oman", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop" },
            { title: "Qatar Groups", desc: "Experience Qatar's modern marvels", img: "https://images.pexels.com/photos/3787839/pexels-photo-3787839.jpeg?auto=compress&cs=tinysrgb&w=600" },
            { title: "Bahrain Groups", desc: "Discover Bahrain's rich culture", img: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=600&auto=format&fit=crop" },
            { title: "UK Groups", desc: "Explore the United Kingdom", img: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=600&auto=format&fit=crop" },
            { title: "All Groups", desc: "Browse all available destinations", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop" },
          ].map((cat, i) => (
            <Link 
              href="/login" 
              key={i} 
              className="group bg-white rounded-[16px] overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.12)] hover:shadow-[0_15px_40px_rgba(225,29,72,0.3)] hover:-translate-y-[8px] transition-all duration-[0.4s] cubic-bezier(0.4,0,0.2,1) block text-center no-underline relative"
            >
              <div className="h-[180px] overflow-hidden relative">
                <img 
                  src={cat.img} 
                  alt={cat.title} 
                  className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-[0.6s] ease" 
                />
                {i < 3 && (
                  <div className="absolute top-[12px] right-[12px] bg-gradient-to-br from-primary to-rose-600 text-white px-[14px] py-[6px] rounded-[30px] text-[11px] font-[700] uppercase tracking-[0.5px] shadow-[0_4px_15px_rgba(225,29,72,0.4)]">
                    {i === 0 ? 'HOT' : i === 1 ? 'NEW' : 'POPULAR'}
                  </div>
                )}
              </div>
              <div className="p-[18px]">
                <h3 className="text-[1.15rem] font-[700] text-[#001948] mb-[8px]">{cat.title}</h3>
                <p className="text-[0.85rem] text-[#64748b] leading-[1.5] m-0">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

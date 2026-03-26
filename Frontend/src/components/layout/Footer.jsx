import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200/60 pt-16 md:pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-16 md:mb-20 text-center md:text-left">
        <div className="col-span-1 md:col-span-2 md:pr-8 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-black tracking-tight text-zinc-950">Curixo</span>
          </div>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed font-medium max-w-sm">
            The intelligent career acceleration platform. We build tools that give candidates an unfair advantage in the modern hiring landscape.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-zinc-950 font-bold mb-6 tracking-tight">Company</h4>
          <ul className="space-y-4 text-sm text-zinc-500 font-medium">
            <li><a href="#" className="hover:text-zinc-950 transition-colors">Our Story</a></li>
            <li><a href="#" className="hover:text-zinc-950 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-zinc-950 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-zinc-950 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-zinc-950 transition-colors">Contact</a></li>
          </ul>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-zinc-950 font-bold mb-6 tracking-tight">Founder's Note</h4>
          <div className="relative text-center md:text-left">
            <span className="text-6xl absolute -top-6 -left-4 text-zinc-200 opacity-50 font-serif hidden md:block">"</span>
            <p className="text-zinc-500 text-sm mb-4 font-medium leading-relaxed relative z-10 italic">
              I built Curixo because rejection without explanation is exhausting. <br className="hidden md:block"/>It’s not just hard, it’s unclear.<br className="hidden md:block"/> I wanted to build something that actually helps you improve.
            </p>
          </div>
          <span className="text-zinc-950 text-sm font-bold tracking-tight mt-1">— Ajay Keshri</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-200/60 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-zinc-400 font-medium text-sm">© 2026 Curixo Intelligence. All rights reserved.</p>
        <p className="text-zinc-400 font-medium text-sm flex items-center gap-1.5">
          Crafted by Ajay Keshri.
        </p>
      </div>
    </footer>
  );
};

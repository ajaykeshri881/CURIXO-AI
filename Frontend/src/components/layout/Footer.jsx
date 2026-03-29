import { Github, MessageSquare, Layers, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYearIST = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date());

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200/60 pt-16 md:pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-16 md:mb-20 text-center md:text-left">
        {/* Brand Section */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2.5 mb-6 h-8">
            <span className="text-xl font-bold tracking-tight text-zinc-950">Curixo</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed font-medium max-w-[240px]">
            The intelligent career acceleration platform. We build tools that give candidates an unfair advantage.
          </p>
        </div>

        {/* Pages Section */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-zinc-950 font-bold mb-6 tracking-tight flex items-center gap-2 h-8">
            <Layers className="w-5 h-5 text-zinc-400" /> Pages
          </h4>
          <ul className="space-y-4 text-sm text-zinc-500 font-medium">
            <li><Link to="/about" className="hover:text-zinc-950 transition-colors">About Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-zinc-950 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-zinc-950 transition-colors">Terms of Service</Link></li>
            <li><Link to="/contact" className="hover:text-zinc-950 transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Feedback Section */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-zinc-950 font-bold mb-6 tracking-tight flex items-center gap-2 h-8">
            <MessageSquare className="w-5 h-5 text-zinc-400" /> Feedback
          </h4>
          <p className="text-zinc-500 text-sm mb-6 font-medium leading-relaxed max-w-[240px]">
            Your ideas help us improve. We value your feedback on how to make Curixo better for everyone.
          </p>
          <a
            href="https://forms.gle/QbRGa7T185AoYty37"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold bg-violet-600 text-white px-5 py-2.5 rounded-full hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/10 active:scale-95 group text-center"
          >
            <MessageSquare className="w-4 h-4" />
            Give Feedback
            <span className="transform transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Open Source Section */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-zinc-950 font-bold mb-6 tracking-tight flex items-center gap-2 h-8">
            <Github className="w-5 h-5 text-zinc-400" /> Open Source
          </h4>
          <p className="text-zinc-500 text-sm mb-6 font-medium leading-relaxed max-w-[240px]">
            Curixo is built for the community. We're open source and welcome contributions to make career growth accessible.
          </p>
          <a
            href="https://github.com/ajaykeshri881/CURIXO-AI-Powered-Career-Platform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold bg-zinc-950 text-white px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 hover:shadow-zinc-900/20 active:scale-95"
          >
            <Github className="w-4 h-4" />
            GitHub Repository
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-200/60 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-zinc-400 font-medium text-sm">© {currentYearIST} Curixo. All rights reserved.</p>
        <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
          <span>Crafted with</span>
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span>by</span>
          <a
            href="https://www.linkedin.com/in/ajaykeshri881"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-950 font-bold hover:text-violet-600 transition-colors border-b border-zinc-200 hover:border-violet-200 pb-0.5"
          >
            Ajay Keshri
          </a>
        </div>
      </div>
    </footer>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.svg';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();
  const isHome = location.pathname === '/';

  // Smoothly scroll to a section by id, navigating to home first if needed
  const handleNavClick = (href, closeMobile = false) => {
    if (closeMobile) setIsOpen(false);
    const hash = href.includes('#') ? href.split('#')[1] : null;
    if (!hash) return;
    if (isHome) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const unauthLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Workflow', href: '/#how-it-works' },
  ];

  const authLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'ATS Scan', href: '/ats-check' },
    { name: 'Interview Preparation', href: '/interview-prep' },
    { name: 'Resume AI', href: '/resume-builder' },
  ];

  const displayLinks = user ? authLinks : unauthLinks;

  // Always apply glassmorphism on interior pages, or when scrolled on home page
  const glassEffect = (!isHome || scrolled)
    ? 'bg-white/80 backdrop-blur-2xl border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
    : 'bg-white/20 backdrop-blur-sm border-white/30';

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none transform-gpu">
      <div className={`relative z-50 pointer-events-auto flex items-center w-full max-w-6xl transition-all duration-500 rounded-3xl md:rounded-[2rem] px-5 md:px-6 py-3 md:py-3 border will-change-transform ${glassEffect}`}>

        {/* Logo - Left */}
        <div className="flex-1 flex items-center">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <img src={logo} alt="Curixo AI" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
            <span className="text-xl font-black tracking-tight text-zinc-950">
              Curixo AI
            </span>
          </Link>
        </div>

        {/* Desktop Links - Centered */}
        <div className="hidden lg:flex items-center justify-center gap-8">
          {displayLinks.map((link) => {
            const isHash = link.href.includes('#');
            const isActive = !isHash && location.pathname === link.href;
            return isHash ? (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-bold transition-colors text-zinc-500 hover:text-zinc-950 cursor-pointer bg-transparent border-none outline-none"
              >
                {link.name}
              </button>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-bold transition-colors ${isActive ? 'text-violet-600' : 'text-zinc-500 hover:text-zinc-950'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Buttons - Right */}
        <div className="hidden lg:flex flex-1 items-center justify-end gap-3">
          {user ? (
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-bold bg-zinc-950 text-white px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20 ring-1 ring-zinc-950 transform-gpu"
              >
                Dashboard
              </motion.button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-colors px-4 py-2 rounded-full hover:bg-zinc-100/50">
                Login
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-bold bg-zinc-950 text-white px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20 ring-1 ring-zinc-950 transform-gpu"
                >
                  Signup
                </motion.button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle - Right */}
        <div className="flex-1 flex justify-end lg:hidden">
          <button className="text-zinc-950 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 top-0 left-0 w-screen h-screen bg-zinc-900/10 backdrop-blur-md z-40 lg:hidden pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-3xl border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto p-6 lg:hidden transform-gpu z-50 will-change-transform"
          >
            <div className="flex flex-col gap-2">
              {displayLinks.map((link) => {
                const isHash = link.href.includes('#');
                const isActive = !isHash && location.pathname === link.href;
                return isHash ? (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href, true)}
                    className="font-bold py-4 border-b border-zinc-100 flex justify-between items-center text-lg text-zinc-500 hover:text-zinc-950 w-full text-left bg-transparent border-l-0 border-r-0 border-t-0 outline-none"
                  >
                    {link.name}
                    <ChevronRight className="w-5 h-5 text-zinc-300" />
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-bold py-4 border-b border-zinc-100 flex justify-between items-center text-lg ${isActive ? 'text-violet-600' : 'text-zinc-500 hover:text-zinc-950'}`}
                  >
                    {link.name}
                    <ChevronRight className={`w-5 h-5 ${isActive ? 'text-violet-400' : 'text-zinc-300'}`} />
                  </Link>
                );
              })}
              <div className="flex flex-col gap-3 pt-6">
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-4 text-white bg-zinc-950 rounded-2xl font-bold text-lg shadow-xl shadow-zinc-900/20 active:scale-95 transition-transform">Dashboard</button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <button className="w-full py-4 text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-lg hover:bg-zinc-100 active:bg-zinc-200 transition-colors">Login</button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <button className="w-full py-4 text-white bg-zinc-950 rounded-2xl font-bold text-lg shadow-xl shadow-zinc-900/20 active:scale-95 transition-transform">Signup</button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

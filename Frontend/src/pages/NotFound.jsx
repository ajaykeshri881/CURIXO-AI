import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center relative pt-24 pb-20 px-6">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-violet-400/15 rounded-full blur-[80px] md:blur-[120px] transform-gpu"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-400/15 rounded-full blur-[80px] md:blur-[120px] transform-gpu"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] md:bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
        </div>

        <div className="max-w-2xl w-full text-center relative z-20 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-20 h-20 sm:w-28 sm:h-28 bg-white border border-zinc-200 rounded-2xl md:rounded-3xl shadow-xl shadow-zinc-200/50 flex items-center justify-center mb-8 md:mb-10 transform-gpu"
          >
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-violet-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[80px] leading-[1] sm:text-[120px] md:text-[160px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-950 to-zinc-600 mb-2 md:mb-4"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4 md:mb-6"
          >
            Page not found
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-zinc-500 mb-10 max-w-md mx-auto leading-relaxed font-medium"
          >
            The page you're looking for seems to have been moved, deleted, or never existed in the first place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-zinc-950 text-white rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all transform-gpu group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
